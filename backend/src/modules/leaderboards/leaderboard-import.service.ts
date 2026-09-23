import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StatCategory } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { FileImportSummaryDto, ImportResultDto } from './dto/import-result.dto';
import { GetLeadersQueryDto } from './dto/get-leaders.dto';

export interface ParsedLeaderRow {
  seasonCode: string;
  startYear: number;
  endYear: number;
  playerName: string;
  playerSlug: string;
  teamRaw: string;
  category: StatCategory;
  statValue: number;
  extraAttributes: Record<string, any>;
}

@Injectable()
export class LeaderboardImportService {
  private readonly logger = new Logger(LeaderboardImportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process multiple uploaded Excel workbooks in an atomic/idempotent pipeline.
   */
  async processUploadedFiles(files: Express.Multer.File[]): Promise<ImportResultDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one Excel file (.xlsx, .xls) must be provided.');
    }

    const fileSummaries: FileImportSummaryDto[] = [];
    const globalErrors: string[] = [];

    let totalRecordsProcessed = 0;
    let totalRecordsInserted = 0;
    let totalRecordsUpdated = 0;
    let processedFiles = 0;

    for (const file of files) {
      try {
        const fileSummary = await this.processSingleWorkbook(file);
        fileSummaries.push(fileSummary);

        if (fileSummary.status === 'SUCCESS' || fileSummary.status === 'PARTIAL') {
          processedFiles++;
        }
        totalRecordsProcessed += fileSummary.totalRows;
        totalRecordsInserted += fileSummary.insertedCount;
        totalRecordsUpdated += fileSummary.updatedCount;
      } catch (err: any) {
        this.logger.error(`Error processing file ${file.originalname}: ${err.message}`, err.stack);
        const errorMsg = `Failed to process ${file.originalname}: ${err.message}`;
        globalErrors.push(errorMsg);
        fileSummaries.push({
          fileName: file.originalname,
          category: 'UNKNOWN',
          totalRows: 0,
          insertedCount: 0,
          updatedCount: 0,
          status: 'FAILED',
          warnings: [err.message],
        });
      }
    }

    return {
      success: globalErrors.length === 0,
      totalFiles: files.length,
      processedFiles,
      totalRecordsProcessed,
      totalRecordsInserted,
      totalRecordsUpdated,
      fileSummaries,
      errors: globalErrors,
    };
  }

  /**
   * Parse a single workbook and upsert records into the database.
   */
  async processSingleWorkbook(file: Express.Multer.File): Promise<FileImportSummaryDto> {
    const { rows, category, warnings } = await this.parseWorkbook(file);

    if (rows.length === 0) {
      return {
        fileName: file.originalname,
        category,
        totalRows: 0,
        insertedCount: 0,
        updatedCount: 0,
        status: 'PARTIAL',
        warnings: [...warnings, 'Workbook parsed successfully, but contained 0 valid data rows.'],
      };
    }

    let insertedCount = 0;
    let updatedCount = 0;

    // Process rows inside a transaction for data consistency
    await this.prisma.$transaction(
      async (tx) => {
        // Cache canonical teams in memory for efficient lookups
        const allTeams = await tx.team.findMany();
        const teamMap = new Map<string, string>();
        for (const t of allTeams) {
          teamMap.set(t.name.toLowerCase().trim(), t.id);
          if (t.abbreviation) {
            teamMap.set(t.abbreviation.toLowerCase().trim(), t.id);
          }
        }

        for (const item of rows) {
          // 1. Upsert Season
          const season = await tx.season.upsert({
            where: { code: item.seasonCode },
            create: {
              code: item.seasonCode,
              startYear: item.startYear,
              endYear: item.endYear,
            },
            update: {
              startYear: item.startYear,
              endYear: item.endYear,
            },
          });

          // 2. Upsert Player (deduplication via unique slug)
          const player = await tx.player.upsert({
            where: { slug: item.playerSlug },
            create: {
              fullName: item.playerName,
              slug: item.playerSlug,
            },
            update: {
              fullName: item.playerName,
            },
          });

          // 3. Resolve canonical team if exact match exists (nullable for multi-team entries like 'Ara-Zul')
          const canonicalTeamId = teamMap.get(item.teamRaw.toLowerCase().trim()) || null;

          // 4. Check existing leader record to track inserted vs updated
          const existing = await tx.seasonLeader.findUnique({
            where: {
              season_player_category: {
                seasonId: season.id,
                playerId: player.id,
                category: item.category,
              },
            },
          });

          if (existing) {
            await tx.seasonLeader.update({
              where: { id: existing.id },
              data: {
                teamRaw: item.teamRaw,
                teamId: canonicalTeamId,
                statValue: item.statValue,
                extraAttributes: item.extraAttributes,
              },
            });
            updatedCount++;
          } else {
            await tx.seasonLeader.create({
              data: {
                seasonId: season.id,
                playerId: player.id,
                teamRaw: item.teamRaw,
                teamId: canonicalTeamId,
                category: item.category,
                statValue: item.statValue,
                extraAttributes: item.extraAttributes,
              },
            });
            insertedCount++;
          }
        }
      },
      {
        timeout: 60000, // 60s timeout for large multi-decade spreadsheets
      },
    );

    return {
      fileName: file.originalname,
      category,
      totalRows: rows.length,
      insertedCount,
      updatedCount,
      status: 'SUCCESS',
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Parse an Excel workbook buffer into normalized data rows.
   */
  async parseWorkbook(file: Express.Multer.File): Promise<{
    rows: ParsedLeaderRow[];
    category: StatCategory;
    warnings: string[];
  }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException(`Workbook in ${file.originalname} contains no worksheets.`);
    }

    const warnings: string[] = [];
    const headerRow = worksheet.getRow(1);
    const headers: Record<number, string> = {};

    headerRow.eachCell((cell, colNumber) => {
      const val = this.extractCellValue(cell.value).toLowerCase();
      // Normalize common accent characters in headers (e.g., año -> ano)
      headers[colNumber] = this.stripAccents(val);
    });

    const category = this.detectCategory(file.originalname, Object.values(headers));
    const rows: ParsedLeaderRow[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const rowData: Record<string, any> = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const headerKey = headers[colNumber];
        if (headerKey) {
          rowData[headerKey] = cell.value;
        }
      });

      // Extract Year / Season
      const rawSeason = this.extractCellValue(
        rowData['ano'] || rowData['year'] || rowData['temporada'] || rowData['temporadas'] || '',
      );

      // Extract Player Name
      const rawPlayerName = this.extractCellValue(
        rowData['jugador'] ||
          rowData['bateador'] ||
          rowData['player'] ||
          rowData['nombre'] ||
          '',
      );

      // Extract Team
      const rawTeam = this.extractCellValue(
        rowData['equipo'] || rowData['team'] || rowData['club'] || '',
      );

      if (!rawSeason || !rawPlayerName) {
        return; // Ignore empty/summary rows
      }

      const { seasonCode, startYear, endYear } = this.parseSeason(rawSeason);
      const playerSlug = this.generateSlug(rawPlayerName);

      let statValue = 0;
      const extraAttributes: Record<string, any> = {};

      switch (category) {
        case StatCategory.BATTING_AVERAGE: {
          const rawAvg = this.parseNumericValue(rowData['avg'] || rowData['average'] || rowData['promedio'] || 0);
          statValue = rawAvg;
          if (rowData['jj'] !== undefined) extraAttributes['jj'] = this.parseNumericValue(rowData['jj']);
          if (rowData['vb'] !== undefined) extraAttributes['vb'] = this.parseNumericValue(rowData['vb']);
          if (rowData['h'] !== undefined) extraAttributes['h'] = this.parseNumericValue(rowData['h']);
          break;
        }
        case StatCategory.HOME_RUNS: {
          statValue = this.parseNumericValue(rowData['hr'] || rowData['homerun'] || rowData['jonrones'] || 0);
          break;
        }
        case StatCategory.DOUBLES: {
          statValue = this.parseNumericValue(rowData['d'] || rowData['dobles'] || rowData['2b'] || 0);
          break;
        }
        case StatCategory.TRIPLES: {
          statValue = this.parseNumericValue(rowData['total'] || rowData['triples'] || rowData['3b'] || 0);
          break;
        }
        case StatCategory.HITS: {
          statValue = this.parseNumericValue(rowData['h'] || rowData['hits'] || rowData['imparables'] || 0);
          break;
        }
        case StatCategory.RUNS: {
          statValue = this.parseNumericValue(rowData['ca'] || rowData['anotadas'] || rowData['carreras'] || 0);
          break;
        }
      }

      rows.push({
        seasonCode,
        startYear,
        endYear,
        playerName: rawPlayerName,
        playerSlug,
        teamRaw: rawTeam || 'Sin equipo',
        category,
        statValue,
        extraAttributes,
      });
    });

    return { rows, category, warnings };
  }

  /**
   * Retrieve stored leaderboard records with filtering and pagination.
   */
  async getLeaders(query: GetLeadersQueryDto) {
    const { category, season, limit = 50, offset = 0 } = query;

    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (season) {
      where.season = { code: season };
    }

    const [total, records] = await Promise.all([
      this.prisma.seasonLeader.count({ where }),
      this.prisma.seasonLeader.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { season: { startYear: 'desc' } },
          { statValue: 'desc' },
        ],
        include: {
          season: {
            select: { code: true, startYear: true, endYear: true },
          },
          player: {
            select: { id: true, fullName: true, slug: true },
          },
          team: {
            select: { id: true, name: true, abbreviation: true },
          },
        },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      records: records.map((r) => ({
        id: r.id,
        season: r.season.code,
        startYear: r.season.startYear,
        endYear: r.season.endYear,
        player: r.player.fullName,
        playerSlug: r.player.slug,
        teamRaw: r.teamRaw,
        canonicalTeam: r.team ? r.team.name : null,
        category: r.category,
        statValue: Number(r.statValue),
        extraAttributes: r.extraAttributes,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Intelligently infer statistical category from filename or header keys.
   */
  detectCategory(fileName: string, headers: string[]): StatCategory {
    const lowerName = fileName.toLowerCase();
    const joinedHeaders = headers.join(' ').toLowerCase();

    // 1. Batting average
    if (lowerName.includes('bate') || headers.includes('avg') || headers.includes('promedio')) {
      return StatCategory.BATTING_AVERAGE;
    }

    // 2. Home Runs
    if (lowerName.includes('homerun') || lowerName.includes('jonron') || headers.includes('hr')) {
      return StatCategory.HOME_RUNS;
    }

    // 3. Doubles
    if (lowerName.includes('doble') || headers.includes('2b') || (lowerName.includes('double') && headers.includes('d'))) {
      return StatCategory.DOUBLES;
    }
    if (headers.includes('d') && !headers.includes('h') && !headers.includes('ca')) {
      return StatCategory.DOUBLES;
    }

    // 4. Triples
    if (lowerName.includes('triple') || headers.includes('3b') || (lowerName.includes('triples') && headers.includes('total'))) {
      return StatCategory.TRIPLES;
    }

    // 5. Hits
    if (lowerName.includes('hit') || lowerName.includes('imparable') || (headers.includes('h') && !headers.includes('avg'))) {
      return StatCategory.HITS;
    }

    // 6. Runs
    if (lowerName.includes('anotada') || lowerName.includes('carrera') || headers.includes('ca')) {
      return StatCategory.RUNS;
    }

    // Fallback detection from headers alone
    if (joinedHeaders.includes('total') && lowerName.includes('tripl')) {
      return StatCategory.TRIPLES;
    }

    throw new BadRequestException(
      `Unrecognized statistical category for file "${fileName}". Expected one of: Batting Average, Hits, Doubles, Triples, Home Runs, or Runs.`,
    );
  }

  /**
   * Parses season codes like '1946-46', '1946-47', '2025-26', or '1950'.
   */
  parseSeason(raw: string): { seasonCode: string; startYear: number; endYear: number } {
    const cleaned = raw.trim();

    // Pattern: 1946-47 or 1946-1947 or 1946/47
    const rangeMatch = cleaned.match(/^(\d{4})[-/](\d{2,4})$/);
    if (rangeMatch) {
      const startYear = parseInt(rangeMatch[1], 10);
      let endPart = rangeMatch[2];
      let endYear: number;

      if (endPart.length === 2) {
        // e.g., '47' -> 1947 or 2047
        const century = Math.floor(startYear / 100) * 100;
        endYear = century + parseInt(endPart, 10);
        // Handle century boundary if needed (e.g. 1999-00)
        if (endYear < startYear) {
          endYear += 100;
        }
      } else {
        endYear = parseInt(endPart, 10);
      }

      const standardCode = `${startYear}-${String(endYear).slice(-2)}`;
      return { seasonCode: standardCode, startYear, endYear };
    }

    // Single 4-digit year: '1950'
    const singleMatch = cleaned.match(/^(\d{4})$/);
    if (singleMatch) {
      const year = parseInt(singleMatch[1], 10);
      return { seasonCode: `${year}-${String(year).slice(-2)}`, startYear: year, endYear: year };
    }

    // Fallback: return cleaned string with estimated year
    const digits = cleaned.match(/\d{4}/);
    const fallbackYear = digits ? parseInt(digits[0], 10) : new Date().getFullYear();
    return { seasonCode: cleaned, startYear: fallbackYear, endYear: fallbackYear };
  }

  /**
   * Normalized URL-safe slug for deduplicating player identities across sheets.
   */
  generateSlug(name: string): string {
    return this.stripAccents(name)
      .toLowerCase()
      .replace(/['"“”‘’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
  }

  /**
   * Utility to strip diacritics/accents from Spanish strings.
   */
  stripAccents(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Safely extract text from ExcelJS CellValue (string, number, richText, formula result).
   */
  private extractCellValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') {
      if ('richText' in value && Array.isArray(value.richText)) {
        return value.richText.map((t: any) => t.text || '').join('').trim();
      }
      if ('result' in value) {
        return String(value.result ?? '').trim();
      }
      if ('text' in value) {
        return String(value.text ?? '').trim();
      }
    }
    return String(value).trim();
  }

  /**
   * Safely parse numeric value from cell or string (handling decimals like .403 or 0.403).
   */
  private parseNumericValue(value: any): number {
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    const str = this.extractCellValue(value);
    if (!str) return 0;
    const parsed = parseFloat(str.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }
}
