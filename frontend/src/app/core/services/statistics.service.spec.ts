import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatisticsService } from './statistics.service';
import { BattingCategory, PitchingCategory } from '../models/statistics.model';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(() => {
    service = new StatisticsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBattingLeaders', () => {
    const categories: BattingCategory[] = ['HR', 'H', 'AVG', 'SB'];

    categories.forEach((cat) => {
      it(`should return records for batting category ${cat}`, async () => {
        const promise = new Promise<void>((resolve) => {
          service.getBattingLeaders(cat).subscribe((records) => {
            expect(records.length).toBeGreaterThanOrEqual(20);
            expect(records[0].rank).toBe(1);
            expect(records[0].player).toBeTruthy();
            expect(records[0].value).toBeDefined();
            resolve();
          });
        });
        await promise;
      });
    });
  });

  describe('getPitchingLeaders', () => {
    const categories: PitchingCategory[] = ['W', 'SO', 'SV'];

    categories.forEach((cat) => {
      it(`should return records for pitching category ${cat}`, async () => {
        const promise = new Promise<void>((resolve) => {
          service.getPitchingLeaders(cat).subscribe((records) => {
            expect(records.length).toBeGreaterThanOrEqual(20);
            expect(records[0].rank).toBe(1);
            expect(records[0].player).toBeTruthy();
            expect(records[0].value).toBeDefined();
            resolve();
          });
        });
        await promise;
      });
    });
  });
});
