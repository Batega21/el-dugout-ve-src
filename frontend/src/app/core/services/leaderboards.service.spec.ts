import '@angular/compiler';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { LeaderboardsService } from './leaderboards.service';

describe('LeaderboardsService', () => {
  let service: LeaderboardsService;
  let mockHttpClient: {
    post: any;
    get: any;
  };

  beforeEach(() => {
    mockHttpClient = {
      post: vi.fn().mockReturnValue(of({})),
      get: vi.fn().mockReturnValue(of({ total: 0, records: [] })),
    };

    const injector = Injector.create({
      providers: [
        LeaderboardsService,
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });

    service = injector.get(LeaderboardsService);
  });

  describe('detectCategoryPreview', () => {
    it('detects Batting Average from file name', () => {
      const res = service.detectCategoryPreview('lider-bate.xlsx');
      expect(res.category).toBe('BATTING_AVERAGE');
      expect(res.label).toBe('Batting Average');
    });

    it('detects Home Runs from file name', () => {
      const res = service.detectCategoryPreview('lider-homerun.xlsx');
      expect(res.category).toBe('HOME_RUNS');
      expect(res.label).toBe('Home Runs');
    });

    it('detects Doubles from file name', () => {
      const res = service.detectCategoryPreview('lider-dobles.xlsx');
      expect(res.category).toBe('DOUBLES');
      expect(res.label).toBe('Doubles');
    });

    it('detects Triples from file name', () => {
      const res = service.detectCategoryPreview('lider-triples.xlsx');
      expect(res.category).toBe('TRIPLES');
      expect(res.label).toBe('Triples');
    });

    it('detects Hits from file name', () => {
      const res = service.detectCategoryPreview('lider-hits.xlsx');
      expect(res.category).toBe('HITS');
      expect(res.label).toBe('Hits');
    });

    it('detects Runs from file name', () => {
      const res = service.detectCategoryPreview('lider-anotadas.xlsx');
      expect(res.category).toBe('RUNS');
      expect(res.label).toBe('Runs Scored');
    });

    it('detects Innings Pitched from file name', () => {
      const res = service.detectCategoryPreview('lider-innings.xlsx');
      expect(res.category).toBe('INNINGS_PITCHED');
      expect(res.label).toBe('Innings Pitched');
    });

    it('returns unknown for generic file names', () => {
      const res = service.detectCategoryPreview('general-roster.xlsx');
      expect(res.category).toBe('UNKNOWN');
      expect(res.label).toBe('Excel Dataset');
    });
  });

  describe('uploadFiles', () => {
    it('constructs FormData and posts with progress tracking enabled', () => {
      const fakeFile = new File(['dummy content'], 'lider-bate.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      service.uploadFiles([fakeFile]);

      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
      const [url, formData, options] = mockHttpClient.post.mock.calls[0];
      expect(url).toBe('leaderboards/import');
      expect(formData instanceof FormData).toBe(true);
      expect(options.reportProgress).toBe(true);
      expect(options.observe).toBe('events');
    });
  });

  describe('getLeaders', () => {
    it('calls GET leaderboards/leaders with category and pagination parameters', () => {
      service.getLeaders('BATTING_AVERAGE', '2025-26', 25, 10);

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      const [url, options] = mockHttpClient.get.mock.calls[0];
      expect(url).toBe('leaderboards/leaders');
      expect(options.params.get('category')).toBe('BATTING_AVERAGE');
      expect(options.params.get('season')).toBe('2025-26');
      expect(options.params.get('limit')).toBe('25');
      expect(options.params.get('offset')).toBe('10');
    });
  });

  describe('getTopRecords', () => {
    it('calls GET leaderboards/top-records', () => {
      const mockRecords = [
        { label: 'Récord AVG', value: '.430 — Alí Castillo 2020-21' },
      ];
      mockHttpClient.get.mockReturnValue(of(mockRecords));

      let result: any;
      service.getTopRecords().subscribe((res) => (result = res));

      expect(mockHttpClient.get).toHaveBeenCalledWith('leaderboards/top-records');
      expect(result).toEqual(mockRecords);
    });
  });
});
