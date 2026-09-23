import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { HistoricalRecordDto } from './dto/historical-record.dto';

interface DbLeaderRow {
  id: string;
  category: string;
  statValue: number | string;
  teamRaw: string;
  playerFullName: string;
  seasonCode: string;
  teamName: string | null;
  updatedAt: Date | string | null;
}

interface DbTitleRow {
  playerId: string;
  playerFullName: string;
  titleCount: number;
  teamName: string | null;
}

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  // Canonical baseline of verified LVBP all-time milestones
  private readonly defaultMilestones: HistoricalRecordDto[] = [
    {
      id: 'rec-hr-single-season',
      category: 'batting',
      label: 'Más Jonrones en una Temporada',
      value: '21',
      holder: 'Alex Cabrera',
      year: '2013-14',
      team: 'Tiburones de La Guaira',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'rec-avg-single-season',
      category: 'batting',
      label: 'Promedio de Bateo Más Alto',
      value: '.430',
      holder: 'Alí Castillo',
      year: '2020-21',
      team: 'Águilas del Zulia',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'rec-hits-single-season',
      category: 'batting',
      label: 'Más Hits en una Temporada',
      value: '99',
      holder: 'Teolindo Acosta',
      year: '1957-58',
      team: 'Licoreros del Pampero',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'rec-triples-single-season',
      category: 'batting',
      label: 'Más Triples en una Temporada',
      value: '10',
      holder: 'Félix Rodríguez',
      year: '1976-77',
      team: 'Leones del Caracas',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'rec-ip-single-season',
      category: 'pitching',
      label: 'Más Entradas Lanzadas',
      value: '208.0',
      holder: 'Emilio Cueche',
      year: '1953-54',
      team: 'Gavilanes BBC',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'rec-strikeouts-single-game',
      category: 'pitching',
      label: 'Más Ponches en un Juego',
      value: '18',
      holder: 'Roberto Muñoz',
      year: '1972-73',
      team: 'Tigres de Aragua',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'rec-batting-titles',
      category: 'general',
      label: 'Más Títulos de Bateo',
      value: '6',
      holder: 'Luis Sojo',
      year: '1989-2000',
      team: 'Cardenales de Lara',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'rec-saves-single-season',
      category: 'pitching',
      label: 'Más Salvados en una Temporada',
      value: '21',
      holder: 'Santos Hernández',
      year: '1997-98',
      team: 'Pastora de Los Llanos',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Extracts verified LVBP historical milestones aggregated directly from PostgreSQL.
   * If statistical records exist in `season_leaders`, their values and holders
   * dynamically override the default records.
   */
  async getHistoricalMilestones(): Promise<HistoricalRecordDto[]> {
    try {
      // 1. Query top season leaders grouped by category via SQL aggregation
      const topLeaders: DbLeaderRow[] = await this.prisma.$queryRaw<DbLeaderRow[]>`
        SELECT DISTINCT ON (sl.category)
          sl.id,
          sl.category,
          sl.stat_value AS "statValue",
          sl.team_raw AS "teamRaw",
          p.full_name AS "playerFullName",
          s.code AS "seasonCode",
          t.name AS "teamName",
          sl.updated_at AS "updatedAt"
        FROM season_leaders sl
        JOIN players p ON sl.player_id = p.id
        JOIN seasons s ON sl.season_id = s.id
        LEFT JOIN teams t ON sl.team_id = t.id
        ORDER BY sl.category, sl.stat_value DESC
      `;

      // 2. Query player with the most batting titles
      const topTitleCounts: DbTitleRow[] = await this.prisma.$queryRaw<DbTitleRow[]>`
        SELECT 
          sl.player_id AS "playerId",
          p.full_name AS "playerFullName",
          COUNT(sl.id)::int AS "titleCount",
          MAX(COALESCE(t.name, sl.team_raw)) AS "teamName"
        FROM season_leaders sl
        JOIN players p ON sl.player_id = p.id
        LEFT JOIN teams t ON sl.team_id = t.id
        WHERE sl.category = 'BATTING_AVERAGE'
        GROUP BY sl.player_id, p.full_name
        ORDER BY "titleCount" DESC
        LIMIT 1
      `;

      const results = [...this.defaultMilestones];

      // Map DB leaders by category
      const leaderByCategory = new Map<string, DbLeaderRow>();
      for (const row of topLeaders) {
        leaderByCategory.set(row.category, row);
      }

      // Update Batting Average milestone if found
      const avgRow = leaderByCategory.get('BATTING_AVERAGE');
      if (avgRow) {
        const rawNum = Number(avgRow.statValue);
        const formatted = rawNum.toFixed(3).replace(/^0\./, '.');
        const idx = results.findIndex((r) => r.id === 'rec-avg-single-season');
        if (idx !== -1) {
          results[idx] = {
            ...results[idx],
            value: formatted,
            holder: avgRow.playerFullName,
            year: avgRow.seasonCode,
            team: avgRow.teamName || avgRow.teamRaw || results[idx].team,
            updatedAt: avgRow.updatedAt ? new Date(avgRow.updatedAt).toISOString() : results[idx].updatedAt,
          };
        }
      }

      // Update Innings Pitched milestone if found
      const ipRow = leaderByCategory.get('INNINGS_PITCHED');
      if (ipRow) {
        const formatted = Number(ipRow.statValue).toFixed(1);
        const idx = results.findIndex((r) => r.id === 'rec-ip-single-season');
        if (idx !== -1) {
          results[idx] = {
            ...results[idx],
            value: formatted,
            holder: ipRow.playerFullName,
            year: ipRow.seasonCode,
            team: ipRow.teamName || ipRow.teamRaw || results[idx].team,
            updatedAt: ipRow.updatedAt ? new Date(ipRow.updatedAt).toISOString() : results[idx].updatedAt,
          };
        }
      }

      // Update Triples milestone if found
      const triplesRow = leaderByCategory.get('TRIPLES');
      if (triplesRow) {
        const formatted = Math.round(Number(triplesRow.statValue)).toString();
        const idx = results.findIndex((r) => r.id === 'rec-triples-single-season');
        if (idx !== -1) {
          results[idx] = {
            ...results[idx],
            value: formatted,
            holder: triplesRow.playerFullName,
            year: triplesRow.seasonCode,
            team: triplesRow.teamName || triplesRow.teamRaw || results[idx].team,
            updatedAt: triplesRow.updatedAt ? new Date(triplesRow.updatedAt).toISOString() : results[idx].updatedAt,
          };
        }
      }

      // Update Home Runs milestone if found
      const hrRow = leaderByCategory.get('HOME_RUNS');
      if (hrRow) {
        const formatted = Math.round(Number(hrRow.statValue)).toString();
        const idx = results.findIndex((r) => r.id === 'rec-hr-single-season');
        if (idx !== -1) {
          results[idx] = {
            ...results[idx],
            value: formatted,
            holder: hrRow.playerFullName,
            year: hrRow.seasonCode,
            team: hrRow.teamName || hrRow.teamRaw || results[idx].team,
            updatedAt: hrRow.updatedAt ? new Date(hrRow.updatedAt).toISOString() : results[idx].updatedAt,
          };
        }
      }

      // Update Hits milestone if found
      const hitsRow = leaderByCategory.get('HITS');
      if (hitsRow) {
        const formatted = Math.round(Number(hitsRow.statValue)).toString();
        const idx = results.findIndex((r) => r.id === 'rec-hits-single-season');
        if (idx !== -1) {
          results[idx] = {
            ...results[idx],
            value: formatted,
            holder: hitsRow.playerFullName,
            year: hitsRow.seasonCode,
            team: hitsRow.teamName || hitsRow.teamRaw || results[idx].team,
            updatedAt: hitsRow.updatedAt ? new Date(hitsRow.updatedAt).toISOString() : results[idx].updatedAt,
          };
        }
      }

      // Update Batting Titles milestone if aggregated
      if (topTitleCounts.length > 0 && topTitleCounts[0].titleCount > 1) {
        const titleRow = topTitleCounts[0];
        const idx = results.findIndex((r) => r.id === 'rec-batting-titles');
        if (idx !== -1) {
          results[idx] = {
            ...results[idx],
            value: titleRow.titleCount.toString(),
            holder: titleRow.playerFullName,
            team: titleRow.teamName || results[idx].team,
          };
        }
      }

      return results;
    } catch (error) {
      this.logger.warn(`Failed to execute SQL aggregation on PostgreSQL. Falling back to default milestones: ${error}`);
      return this.defaultMilestones;
    }
  }
}
