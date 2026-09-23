import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StatCategory } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { FileImportSummaryDto, ImportResultDto } from './dto/import-result.dto';
import { GetLeadersQueryDto } from './dto/get-leaders.dto';
import { TopRecordItemDto } from './dto/top-records.dto';
import {
  ValidationPreviewDto,
  ValidationPreviewRowDto,
} from '../imports/dto/validation-preview.dto';
import {
  CommitImportDto,
  CommitResultDto,
} from '../imports/dto/commit-import.dto';

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
    this.validateMagicNumber(file.buffer, file.originalname);

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
   * Retrieve top historical LVBP records for the marquee stats strip ticker.
   * Runs queries to extract the all-time top statistical record in each category:
   * 1. Récord AVG: Highest single-season batting average (.430 — Alí Castillo 2020-21)
   * 2. Récord Innings: Highest single-season innings pitched (208.0 — Emilio Cueche 1953-54)
   * 3. Récord Triples: Highest single-season triples (10 — Félix Rodríguez 1976-77)
   * 4. Más títulos bateo: Player with the most batting champion titles (6x — Luis Sojo)
   * 5. Temporadas registradas: Hardcoded 80 Temporadas LVBP
   */
  async getTopRecords(): Promise<TopRecordItemDto[]> {
    const [topAvg, topInnings, topTriples, titleCounts] = await Promise.all([
      // 1. Highest Batting Average
      this.prisma.seasonLeader.findFirst({
        where: { category: StatCategory.BATTING_AVERAGE },
        orderBy: { statValue: 'desc' },
        include: {
          player: { select: { fullName: true } },
          season: { select: { code: true } },
        },
      }),

      // 2. Highest Innings Pitched
      this.prisma.seasonLeader.findFirst({
        where: { category: StatCategory.INNINGS_PITCHED },
        orderBy: { statValue: 'desc' },
        include: {
          player: { select: { fullName: true } },
          season: { select: { code: true } },
        },
      }),

      // 3. Highest Triples
      this.prisma.seasonLeader.findFirst({
        where: { category: StatCategory.TRIPLES },
        orderBy: { statValue: 'desc' },
        include: {
          player: { select: { fullName: true } },
          season: { select: { code: true } },
        },
      }),

      // 4. Most Batting Titles (category = BATTING_AVERAGE)
      this.prisma.seasonLeader.groupBy({
        by: ['playerId'],
        where: { category: StatCategory.BATTING_AVERAGE },
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: 1,
      }),
    ]);

    // Format 1: Récord AVG (.430 — Alí Castillo 2020-21)
    let avgValue = '.430 — Alí Castillo 2020-21';
    if (topAvg?.player && topAvg?.season) {
      const avgFormatted = Number(topAvg.statValue).toFixed(3).replace(/^0\./, '.');
      avgValue = `${avgFormatted} — ${topAvg.player.fullName} ${topAvg.season.code}`;
    }

    // Format 2: Récord Innings (208.0 — Emilio Cueche 1953-54)
    let inningsValue = '208.0 — Emilio Cueche 1953-54';
    if (topInnings?.player && topInnings?.season) {
      const ipFormatted = Number(topInnings.statValue).toFixed(1);
      inningsValue = `${ipFormatted} — ${topInnings.player.fullName} ${topInnings.season.code}`;
    }

    // Format 3: Récord Triples (10 — Félix Rodríguez 1976-77)
    let triplesValue = '10 — Félix Rodríguez 1976-77';
    if (topTriples?.player && topTriples?.season) {
      const triplesFormatted = Math.round(Number(topTriples.statValue));
      triplesValue = `${triplesFormatted} — ${topTriples.player.fullName} ${topTriples.season.code}`;
    }

    // Format 4: Más títulos bateo (6x — Luis Sojo)
    let mostTitlesValue = '6x — Luis Sojo';
    if (titleCounts.length > 0 && titleCounts[0]._count.id > 1) {
      const topTitlePlayer = await this.prisma.player.findUnique({
        where: { id: titleCounts[0].playerId },
        select: { fullName: true },
      });
      if (topTitlePlayer) {
        mostTitlesValue = `${titleCounts[0]._count.id}x — ${topTitlePlayer.fullName}`;
      }
    }

    return [
      { label: 'Récord AVG', value: avgValue },
      { label: 'Récord Innings', value: inningsValue },
      { label: 'Récord Triples', value: triplesValue },
      { label: 'Más títulos bateo', value: mostTitlesValue },
      { label: 'Temporadas registradas', value: '80 Temporadas LVBP' },
    ];
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

    // 7. Innings Pitched
    if (
      lowerName.includes('inning') ||
      lowerName.includes('entrada') ||
      headers.includes('ip') ||
      headers.includes('el')
    ) {
      return StatCategory.INNINGS_PITCHED;
    }

    // Fallback detection from headers alone
    if (joinedHeaders.includes('total') && lowerName.includes('tripl')) {
      return StatCategory.TRIPLES;
    }

    throw new BadRequestException(
      `Unrecognized statistical category for file "${fileName}". Expected one of: Batting Average, Hits, Doubles, Triples, Home Runs, Runs, or Innings Pitched.`,
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
   * Formula Injection / CSV Injection Sanitization:
   * Strips or escapes any string cell value starting with '=', '+', '-', '@', '\t', '\r'
   * to prevent command execution if re-exported.
   */
  sanitizeFormula(val: string): string {
    if (!val) return '';
    const dangerousPrefixes = ['=', '+', '-', '@', '\t', '\r'];
    if (dangerousPrefixes.includes(val.charAt(0))) {
      return `'${val}`;
    }
    return val;
  }

  /**
   * Binary Signature (Magic Number) verification:
   * Enforces that uploaded files are authentic ZIP/XLSX (50 4B 03 04) or OLE2/XLS (D0 CF 11 E0).
   * Rejects executable masquerades immediately.
   */
  validateMagicNumber(buffer: Buffer, fileName: string): void {
    if (!buffer || buffer.length < 4) {
      throw new BadRequestException(
        `File "${fileName}" is empty or too small to be a valid spreadsheet.`,
      );
    }

    const first4 = buffer.subarray(0, 4);
    // XLSX is a ZIP container: 50 4B 03 04 ('PK\x03\x04')
    const isZip =
      first4[0] === 0x50 &&
      first4[1] === 0x4b &&
      first4[2] === 0x03 &&
      first4[3] === 0x04;
    // Legacy XLS (OLE2 Compound Document): D0 CF 11 E0
    const isOls =
      first4[0] === 0xd0 &&
      first4[1] === 0xcf &&
      first4[2] === 0x11 &&
      first4[3] === 0xe0;

    if (!isZip && !isOls) {
      throw new BadRequestException(
        `Invalid binary signature for file "${fileName}". Only authentic Excel spreadsheets (.xlsx, .xls) are permitted. Executable or disguised files are blocked.`,
      );
    }
  }

  /**
   * Structure validation: Ensures required columns exist in the worksheet.
   */
  validateRequiredHeaders(headers: string[], category: StatCategory, fileName: string): void {
    const headerList = headers.map((h) => this.stripAccents(h.toLowerCase().trim()));

    const hasSeason = headerList.some((h) =>
      ['ano', 'year', 'temporada', 'temporadas'].includes(h),
    );
    const hasPlayer = headerList.some((h) =>
      ['jugador', 'bateador', 'player', 'nombre'].includes(h),
    );
    const hasTeam = headerList.some((h) => ['equipo', 'team', 'club'].includes(h));

    const missingColumns: string[] = [];
    if (!hasSeason) missingColumns.push('Temporada/Año');
    if (!hasPlayer) missingColumns.push('Jugador/Bateador');
    if (!hasTeam) missingColumns.push('Equipo');

    let hasMetric = false;
    switch (category) {
      case StatCategory.BATTING_AVERAGE:
        hasMetric = headerList.some((h) => ['avg', 'promedio', 'average'].includes(h));
        if (!hasMetric) missingColumns.push('Promedio (AVG)');
        break;
      case StatCategory.HOME_RUNS:
        hasMetric = headerList.some((h) => ['hr', 'homerun', 'jonrones'].includes(h));
        if (!hasMetric) missingColumns.push('Jonrones (HR)');
        break;
      case StatCategory.DOUBLES:
        hasMetric = headerList.some((h) => ['d', 'dobles', '2b'].includes(h));
        if (!hasMetric) missingColumns.push('Dobles (2B/D)');
        break;
      case StatCategory.TRIPLES:
        hasMetric = headerList.some((h) => ['total', 'triples', '3b'].includes(h));
        if (!hasMetric) missingColumns.push('Triples (3B/TOTAL)');
        break;
      case StatCategory.HITS:
        hasMetric = headerList.some((h) => ['h', 'hits', 'imparables'].includes(h));
        if (!hasMetric) missingColumns.push('Hits (H)');
        break;
      case StatCategory.RUNS:
        hasMetric = headerList.some((h) => ['ca', 'anotadas', 'carreras'].includes(h));
        if (!hasMetric) missingColumns.push('Carreras Anotadas (CA)');
        break;
      case StatCategory.INNINGS_PITCHED:
        hasMetric = headerList.some((h) => ['ip', 'el', 'entradas'].includes(h));
        if (!hasMetric) missingColumns.push('Entradas Lanzadas (IP/EL)');
        break;
    }

    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `File "${fileName}" does not meet structural requirements. Missing required column(s): ${missingColumns.join(', ')}.`,
      );
    }
  }

  /**
   * Dry-run preview of an Excel workbook.
   * Validates file security (MIME, size, magic signature), sanitizes formulas,
   * validates headers, checks database duplication, and returns structured row previews.
   */
  async previewWorkbook(file: Express.Multer.File): Promise<ValidationPreviewDto> {
    if (!file) {
      throw new BadRequestException('No Excel file provided for preview.');
    }

    if (file.size > 8 * 1024 * 1024) {
      throw new BadRequestException(
        `File "${file.originalname}" exceeds the 8 MB maximum size limit.`,
      );
    }

    this.validateMagicNumber(file.buffer, file.originalname);

    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(file.buffer as any);
    } catch (err: any) {
      throw new BadRequestException(
        `Unable to parse Excel workbook in "${file.originalname}": ${err.message}`,
      );
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException(`Workbook in "${file.originalname}" contains no worksheets.`);
    }

    const headerRow = worksheet.getRow(1);
    const headers: Record<number, string> = {};
    headerRow.eachCell((cell, colNumber) => {
      const val = this.extractCellValue(cell.value).toLowerCase();
      headers[colNumber] = this.stripAccents(val);
    });

    const category = this.detectCategory(file.originalname, Object.values(headers));
    this.validateRequiredHeaders(Object.values(headers), category, file.originalname);

    // Fetch existing records for duplicate detection
    const [allSeasons, allPlayers, allTeams, existingLeaders] = await Promise.all([
      this.prisma.season.findMany(),
      this.prisma.player.findMany(),
      this.prisma.team.findMany(),
      this.prisma.seasonLeader.findMany({
        where: { category },
        select: { seasonId: true, playerId: true },
      }),
    ]);

    const seasonMap = new Map<string, string>(); // code -> id
    for (const s of allSeasons) {
      seasonMap.set(s.code, s.id);
    }

    const playerMap = new Map<string, string>(); // slug -> id
    for (const p of allPlayers) {
      playerMap.set(p.slug, p.id);
    }

    const teamMap = new Map<string, string>();
    for (const t of allTeams) {
      teamMap.set(t.name.toLowerCase().trim(), t.name);
      if (t.abbreviation) {
        teamMap.set(t.abbreviation.toLowerCase().trim(), t.name);
      }
    }

    const existingLeaderSet = new Set<string>();
    for (const l of existingLeaders) {
      existingLeaderSet.add(`${l.seasonId}::${l.playerId}`);
    }

    const rows: ValidationPreviewRowDto[] = [];
    const batchKeySet = new Set<string>();

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

      // If entire row is blank, skip
      if (!rawSeason && !rawPlayerName && !rawTeam) {
        return;
      }

      let status: 'VALID' | 'DUPLICATE' | 'ERROR' = 'VALID';
      let validationMessage = 'Clean record ready to commit';

      // Validation 1: Missing season or player
      if (!rawSeason || !rawPlayerName) {
        status = 'ERROR';
        validationMessage = 'Missing required season or player identifier.';
      }

      const { seasonCode, startYear, endYear } = this.parseSeason(rawSeason);
      const playerSlug = this.generateSlug(rawPlayerName);

      let statValue = 0;
      const extraAttributes: Record<string, any> = {};

      switch (category) {
        case StatCategory.BATTING_AVERAGE: {
          const rawAvg = this.parseNumericValue(
            rowData['avg'] || rowData['average'] || rowData['promedio'],
          );
          statValue = rawAvg;
          if (rowData['jj'] !== undefined) extraAttributes['jj'] = this.parseNumericValue(rowData['jj']);
          if (rowData['vb'] !== undefined) extraAttributes['vb'] = this.parseNumericValue(rowData['vb']);
          if (rowData['h'] !== undefined) extraAttributes['h'] = this.parseNumericValue(rowData['h']);
          break;
        }
        case StatCategory.HOME_RUNS: {
          statValue = this.parseNumericValue(rowData['hr'] || rowData['homerun'] || rowData['jonrones']);
          break;
        }
        case StatCategory.DOUBLES: {
          statValue = this.parseNumericValue(rowData['d'] || rowData['dobles'] || rowData['2b']);
          break;
        }
        case StatCategory.TRIPLES: {
          statValue = this.parseNumericValue(rowData['total'] || rowData['triples'] || rowData['3b']);
          break;
        }
        case StatCategory.HITS: {
          statValue = this.parseNumericValue(rowData['h'] || rowData['hits'] || rowData['imparables']);
          break;
        }
        case StatCategory.RUNS: {
          statValue = this.parseNumericValue(rowData['ca'] || rowData['anotadas'] || rowData['carreras']);
          break;
        }
        case StatCategory.INNINGS_PITCHED: {
          statValue = this.parseNumericValue(rowData['ip'] || rowData['el'] || rowData['entradas']);
          break;
        }
      }

      // Validation 2: Invalid metric
      if (status !== 'ERROR' && (isNaN(statValue) || statValue < 0)) {
        status = 'ERROR';
        validationMessage = `Invalid numeric stat value (${statValue}) for category ${category}.`;
      }

      // Check Duplication:
      // 1. Batch duplicate
      const batchKey = `${seasonCode}::${playerSlug}`;
      if (status !== 'ERROR') {
        if (batchKeySet.has(batchKey)) {
          status = 'DUPLICATE';
          validationMessage = `Duplicate record found within this spreadsheet for ${rawPlayerName} (${seasonCode}).`;
        } else {
          batchKeySet.add(batchKey);
        }
      }

      // 2. Database duplicate
      if (status === 'VALID') {
        const existingSeasonId = seasonMap.get(seasonCode);
        const existingPlayerId = playerMap.get(playerSlug);
        if (existingSeasonId && existingPlayerId) {
          const leaderKey = `${existingSeasonId}::${existingPlayerId}`;
          if (existingLeaderSet.has(leaderKey)) {
            status = 'DUPLICATE';
            validationMessage = `Existing database record already present for ${rawPlayerName} in season ${seasonCode}.`;
          }
        }
      }

      const canonicalTeam = teamMap.get(rawTeam.toLowerCase().trim()) || null;

      rows.push({
        rowNumber,
        seasonCode,
        startYear,
        endYear,
        playerName: rawPlayerName,
        playerSlug,
        teamRaw: rawTeam || 'Sin equipo',
        canonicalTeam,
        category,
        statValue,
        extraAttributes,
        status,
        validationMessage,
      });
    });

    const total = rows.length;
    const valid = rows.filter((r) => r.status === 'VALID').length;
    const duplicates = rows.filter((r) => r.status === 'DUPLICATE').length;
    const errors = rows.filter((r) => r.status === 'ERROR').length;

    return {
      fileName: file.originalname,
      category,
      summary: {
        total,
        valid,
        duplicates,
        errors,
      },
      rows,
    };
  }

  /**
   * Commit validated rows to the database inside an ACID transaction.
   */
  async commitValidatedRows(dto: CommitImportDto): Promise<CommitResultDto> {
    if (!dto.rows || dto.rows.length === 0) {
      throw new BadRequestException('No rows provided to commit.');
    }

    return await this.prisma.$transaction(
      async (tx) => {
        const allTeams = await tx.team.findMany();
        const teamMap = new Map<string, string>();
        for (const t of allTeams) {
          teamMap.set(t.name.toLowerCase().trim(), t.id);
          if (t.abbreviation) {
            teamMap.set(t.abbreviation.toLowerCase().trim(), t.id);
          }
        }

        let insertedCount = 0;
        let updatedCount = 0;

        for (const item of dto.rows) {
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

          // 2. Upsert Player
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

          const canonicalTeamId = teamMap.get(item.teamRaw.toLowerCase().trim()) || null;

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
                extraAttributes: item.extraAttributes || {},
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
                extraAttributes: item.extraAttributes || {},
              },
            });
            insertedCount++;
          }
        }

        return {
          success: true,
          totalProcessed: dto.rows.length,
          insertedCount,
          updatedCount,
          message: `Successfully committed ${dto.rows.length} records (${insertedCount} inserted, ${updatedCount} updated).`,
        };
      },
      { timeout: 60000 },
    );
  }

  /**
   * Safely extract text from ExcelJS CellValue (string, number, richText, formula result).
   * Automatically runs formula sanitization to prevent spreadsheet execution.
   */
  private extractCellValue(value: any): string {
    if (value === null || value === undefined) return '';
    let text = '';
    if (typeof value === 'object') {
      if ('richText' in value && Array.isArray(value.richText)) {
        text = value.richText.map((t: any) => t.text || '').join('').trim();
      } else if ('result' in value) {
        text = String(value.result ?? '').trim();
      } else if ('text' in value) {
        text = String(value.text ?? '').trim();
      }
    } else {
      text = String(value).trim();
    }
    return this.sanitizeFormula(text);
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
    const cleanStr = str.replace(/^['"]/, '');
    const parsed = parseFloat(cleanStr.replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }
}

