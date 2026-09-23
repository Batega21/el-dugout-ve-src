import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardImportService } from './leaderboard-import.service';
import { PrismaService } from '../../database/prisma.service';
import { StatCategory } from '@prisma/client';
import * as ExcelJS from 'exceljs';

describe('LeaderboardImportService', () => {
  let service: LeaderboardImportService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn().mockImplementation(async (callback) => {
        const tx = {
          team: {
            findMany: jest.fn().mockResolvedValue([
              { id: 'team-1', name: 'Leones del Caracas', abbreviation: 'CAR' },
              { id: 'team-2', name: 'Navegantes del Magallanes', abbreviation: 'MAG' },
            ]),
          },
          season: {
            upsert: jest.fn().mockResolvedValue({ id: 'season-uuid-1', code: '1946-46' }),
          },
          player: {
            upsert: jest.fn().mockResolvedValue({ id: 'player-uuid-1', fullName: 'Jesús Ramos', slug: 'jesus-ramos' }),
          },
          seasonLeader: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: 'leader-uuid-1' }),
            update: jest.fn().mockResolvedValue({ id: 'leader-uuid-1' }),
          },
        };
        return callback(tx);
      }),
      seasonLeader: {
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn(),
        groupBy: jest.fn().mockResolvedValue([]),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'leader-1',
            season: { code: '1946-46', startYear: 1946, endYear: 1946 },
            player: { id: 'p1', fullName: 'Jesús Ramos', slug: 'jesus-ramos' },
            team: { id: 't1', name: 'Magallanes', abbreviation: 'MAG' },
            teamRaw: 'Magallanes',
            category: StatCategory.BATTING_AVERAGE,
            statValue: 0.403,
            extraAttributes: { jj: 30, vb: 120, h: 48 },
            createdAt: new Date(),
          },
        ]),
      },
      player: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardImportService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<LeaderboardImportService>(LeaderboardImportService);
  });

  describe('detectCategory', () => {
    it('detects BATTING_AVERAGE from filename or headers', () => {
      expect(service.detectCategory('lider-bate.xlsx', ['ano', 'jugador', 'avg'])).toBe(
        StatCategory.BATTING_AVERAGE,
      );
      expect(service.detectCategory('random-file.xlsx', ['ano', 'jugador', 'promedio'])).toBe(
        StatCategory.BATTING_AVERAGE,
      );
    });

    it('detects HOME_RUNS from filename or headers', () => {
      expect(service.detectCategory('lider-homerun.xlsx', ['ano', 'jugador', 'hr'])).toBe(
        StatCategory.HOME_RUNS,
      );
    });

    it('detects DOUBLES from filename or headers', () => {
      expect(service.detectCategory('lider-dobles.xlsx', ['ano', 'jugador', 'd'])).toBe(
        StatCategory.DOUBLES,
      );
    });

    it('detects TRIPLES from filename with total header', () => {
      expect(service.detectCategory('lider-triples.xlsx', ['ano', 'jugador', 'total'])).toBe(
        StatCategory.TRIPLES,
      );
    });

    it('detects HITS from filename or headers', () => {
      expect(service.detectCategory('lider-hits.xlsx', ['ano', 'jugador', 'h'])).toBe(
        StatCategory.HITS,
      );
    });

    it('detects RUNS from filename or headers', () => {
      expect(service.detectCategory('lider-anotadas.xlsx', ['ano', 'jugador', 'ca'])).toBe(
        StatCategory.RUNS,
      );
    });

    it('detects INNINGS_PITCHED from filename or headers', () => {
      expect(service.detectCategory('lider-innings.xlsx', ['ano', 'jugador', 'ip'])).toBe(
        StatCategory.INNINGS_PITCHED,
      );
      expect(service.detectCategory('entradas-lanzadas.xlsx', ['ano', 'jugador', 'el'])).toBe(
        StatCategory.INNINGS_PITCHED,
      );
    });

    it('throws BadRequestException for unknown category signature', () => {
      expect(() => service.detectCategory('unknown-data.xlsx', ['col1', 'col2'])).toThrow();
    });
  });

  describe('parseSeason', () => {
    it('parses hyphenated 2-digit range seasons (1946-46, 2025-26)', () => {
      const s1 = service.parseSeason('1946-46');
      expect(s1.seasonCode).toBe('1946-46');
      expect(s1.startYear).toBe(1946);
      expect(s1.endYear).toBe(1946);

      const s2 = service.parseSeason('2025-26');
      expect(s2.seasonCode).toBe('2025-26');
      expect(s2.startYear).toBe(2025);
      expect(s2.endYear).toBe(2026);
    });

    it('parses single year strings (1950)', () => {
      const s = service.parseSeason('1950');
      expect(s.startYear).toBe(1950);
      expect(s.endYear).toBe(1950);
    });
  });

  describe('generateSlug', () => {
    it('normalizes accents, removes quotes, and formats URL-friendly slugs', () => {
      expect(service.generateSlug('Jesús Ramos')).toBe('jesus-ramos');
      expect(service.generateSlug('Luis "Camaleón" García')).toBe('luis-camaleon-garcia');
      expect(service.generateSlug('Víctor Davalillo')).toBe('victor-davalillo');
    });
  });

  describe('parseWorkbook & processUploadedFiles', () => {
    it('parses in-memory batting average Excel buffer and returns structured rows', async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Lider Bate');
      sheet.addRow(['Año', 'Bateador', 'Equipo', 'AVG', 'JJ', 'VB', 'H']);
      sheet.addRow(['1946-46', 'Jesús Ramos', 'MAG', 0.403, 30, 119, 48]);
      sheet.addRow(['1946-47', 'Guillermo Vento', 'Ara-Zul', 0.385, 28, 104, 40]);

      const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
      const file: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'lider-bate.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer,
        size: buffer.length,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await service.processUploadedFiles([file]);

      expect(result.success).toBe(true);
      expect(result.totalFiles).toBe(1);
      expect(result.processedFiles).toBe(1);
      expect(result.totalRecordsProcessed).toBe(2);
      expect(result.totalRecordsInserted).toBe(2);
      expect(result.fileSummaries[0].category).toBe(StatCategory.BATTING_AVERAGE);
    });

    it('handles idempotent updates when records already exist', async () => {
      // Mock existing record to trigger update path
      prismaMock.$transaction.mockImplementationOnce(async (callback: any) => {
        const tx = {
          team: { findMany: jest.fn().mockResolvedValue([]) },
          season: { upsert: jest.fn().mockResolvedValue({ id: 's-1' }) },
          player: { upsert: jest.fn().mockResolvedValue({ id: 'p-1' }) },
          seasonLeader: {
            findUnique: jest.fn().mockResolvedValue({ id: 'existing-leader-id' }),
            update: jest.fn().mockResolvedValue({ id: 'existing-leader-id' }),
          },
        };
        return callback(tx);
      });

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Lider HR');
      sheet.addRow(['Año', 'Jugador', 'Equipo', 'HR']);
      sheet.addRow(['2025-26', 'José Martínez', 'Tiburones', 15]);

      const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
      const file: Express.Multer.File = {
        fieldname: 'files',
        originalname: 'lider-homerun.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer,
        size: buffer.length,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await service.processUploadedFiles([file]);

      expect(result.success).toBe(true);
      expect(result.totalRecordsUpdated).toBe(1);
      expect(result.totalRecordsInserted).toBe(0);
    });
  });

  describe('getLeaders', () => {
    it('returns formatted leaderboard records', async () => {
      const response = await service.getLeaders({ category: StatCategory.BATTING_AVERAGE });
      expect(response.total).toBe(1);
      expect(response.records[0].player).toBe('Jesús Ramos');
      expect(response.records[0].statValue).toBe(0.403);
    });
  });

  describe('getTopRecords', () => {
    it('returns formatted top records from database queries', async () => {
      prismaMock.seasonLeader.findFirst
        .mockResolvedValueOnce({
          statValue: 0.430,
          player: { fullName: 'Alí Castillo' },
          season: { code: '2020-21' },
        })
        .mockResolvedValueOnce({
          statValue: 208.0,
          player: { fullName: 'Emilio Cueche' },
          season: { code: '1953-54' },
        })
        .mockResolvedValueOnce({
          statValue: 10,
          player: { fullName: 'Félix Rodríguez' },
          season: { code: '1976-77' },
        });

      prismaMock.seasonLeader.groupBy.mockResolvedValueOnce([
        { playerId: 'player-sojo', _count: { id: 6 } },
      ]);
      prismaMock.player.findUnique.mockResolvedValueOnce({
        fullName: 'Luis Sojo',
      });

      const records = await service.getTopRecords();

      expect(records).toEqual([
        { label: 'Récord AVG', value: '.430 — Alí Castillo 2020-21' },
        { label: 'Récord Innings', value: '208.0 — Emilio Cueche 1953-54' },
        { label: 'Récord Triples', value: '10 — Félix Rodríguez 1976-77' },
        { label: 'Más títulos bateo', value: '6x — Luis Sojo' },
        { label: 'Temporadas registradas', value: '80 Temporadas LVBP' },
      ]);
    });

    it('falls back to default canonical values if records are absent in database', async () => {
      prismaMock.seasonLeader.findFirst.mockResolvedValue(null);
      prismaMock.seasonLeader.groupBy.mockResolvedValue([]);

      const records = await service.getTopRecords();

      expect(records).toEqual([
        { label: 'Récord AVG', value: '.430 — Alí Castillo 2020-21' },
        { label: 'Récord Innings', value: '208.0 — Emilio Cueche 1953-54' },
        { label: 'Récord Triples', value: '10 — Félix Rodríguez 1976-77' },
        { label: 'Más títulos bateo', value: '6x — Luis Sojo' },
        { label: 'Temporadas registradas', value: '80 Temporadas LVBP' },
      ]);
    });
  });
});
