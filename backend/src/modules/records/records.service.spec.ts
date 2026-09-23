import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from './records.service';
import { PrismaService } from '../../database/prisma.service';

describe('RecordsService', () => {
  let service: RecordsService;
  let prisma: PrismaService;

  const mockDbLeaders = [
    {
      id: 'sl-1',
      category: 'BATTING_AVERAGE',
      statValue: 0.43,
      teamRaw: 'Águilas del Zulia',
      playerFullName: 'Alí Castillo',
      seasonCode: '2020-21',
      teamName: 'Águilas del Zulia',
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'sl-2',
      category: 'INNINGS_PITCHED',
      statValue: 208.0,
      teamRaw: 'Gavilanes BBC',
      playerFullName: 'Emilio Cueche',
      seasonCode: '1953-54',
      teamName: 'Gavilanes BBC',
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'sl-3',
      category: 'TRIPLES',
      statValue: 10,
      teamRaw: 'Leones del Caracas',
      playerFullName: 'Félix Rodríguez',
      seasonCode: '1976-77',
      teamName: 'Leones del Caracas',
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'sl-4',
      category: 'HOME_RUNS',
      statValue: 21,
      teamRaw: 'Tiburones de La Guaira',
      playerFullName: 'Alex Cabrera',
      seasonCode: '2013-14',
      teamName: 'Tiburones de La Guaira',
      updatedAt: new Date('2026-01-01'),
    },
    {
      id: 'sl-5',
      category: 'HITS',
      statValue: 99,
      teamRaw: 'Licoreros del Pampero',
      playerFullName: 'Teolindo Acosta',
      seasonCode: '1957-58',
      teamName: 'Licoreros del Pampero',
      updatedAt: new Date('2026-01-01'),
    },
  ];

  const mockTopTitles = [
    {
      playerId: 'player-sojo',
      playerFullName: 'Luis Sojo',
      titleCount: 6,
      teamName: 'Cardenales de Lara',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecordsService>(RecordsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHistoricalMilestones', () => {
    it('should aggregate database records and return 8 formatted milestone cards', async () => {
      (prisma.$queryRaw as jest.Mock)
        .mockResolvedValueOnce(mockDbLeaders)
        .mockResolvedValueOnce(mockTopTitles);

      const records = await service.getHistoricalMilestones();

      expect(records).toHaveLength(8);

      const avgRecord = records.find((r) => r.id === 'rec-avg-single-season');
      expect(avgRecord?.value).toBe('.430');
      expect(avgRecord?.holder).toBe('Alí Castillo');
      expect(avgRecord?.year).toBe('2020-21');
      expect(avgRecord?.category).toBe('batting');

      const ipRecord = records.find((r) => r.id === 'rec-ip-single-season');
      expect(ipRecord?.value).toBe('208.0');
      expect(ipRecord?.holder).toBe('Emilio Cueche');

      const triplesRecord = records.find((r) => r.id === 'rec-triples-single-season');
      expect(triplesRecord?.value).toBe('10');

      const titlesRecord = records.find((r) => r.id === 'rec-batting-titles');
      expect(titlesRecord?.value).toBe('6');
      expect(titlesRecord?.holder).toBe('Luis Sojo');
    });

    it('should fall back gracefully to default milestones if database query fails', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Connection lost'));

      const records = await service.getHistoricalMilestones();

      expect(records).toHaveLength(8);
      expect(records[0].holder).toBe('Alex Cabrera');
      expect(records[1].holder).toBe('Alí Castillo');
    });
  });
});
