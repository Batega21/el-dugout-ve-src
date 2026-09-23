import { Test, TestingModule } from '@nestjs/testing';
import { RecordsController } from './records.controller';
import { RecordsService } from './records.service';
import { HistoricalRecordDto } from './dto/historical-record.dto';

describe('RecordsController', () => {
  let controller: RecordsController;
  let service: RecordsService;

  const mockRecords: HistoricalRecordDto[] = [
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
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordsController],
      providers: [
        {
          provide: RecordsService,
          useValue: {
            getHistoricalMilestones: jest.fn().mockResolvedValue(mockRecords),
          },
        },
      ],
    }).compile();

    controller = module.get<RecordsController>(RecordsController);
    service = module.get<RecordsService>(RecordsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHistoricalMilestones', () => {
    it('should return an array of historical records from service', async () => {
      const result = await controller.getHistoricalMilestones();
      expect(result).toEqual(mockRecords);
      expect(service.getHistoricalMilestones).toHaveBeenCalled();
    });
  });
});
