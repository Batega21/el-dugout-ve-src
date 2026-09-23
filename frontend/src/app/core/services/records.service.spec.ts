import '@angular/compiler';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { RecordsService } from './records.service';
import { HistoricalRecordDto } from '../models/record.model';

describe('RecordsService', () => {
  let service: RecordsService;
  let mockHttpClient: {
    get: any;
  };

  const mockMilestones: HistoricalRecordDto[] = [
    {
      id: 'rec-hr-single-season',
      category: 'batting',
      label: 'Más Jonrones en una Temporada',
      value: '21',
      holder: 'Alex Cabrera',
      year: '2013-14',
      team: 'Tiburones de La Guaira',
    },
  ];

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn().mockReturnValue(of(mockMilestones)),
    };

    const injector = Injector.create({
      providers: [
        RecordsService,
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });

    service = injector.get(RecordsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch historical milestones via GET request to v1/records/historical-milestones', () => {
    service.getHistoricalMilestones().subscribe((data) => {
      expect(data).toEqual(mockMilestones);
    });

    expect(mockHttpClient.get).toHaveBeenCalledWith('v1/records/historical-milestones');
  });
});
