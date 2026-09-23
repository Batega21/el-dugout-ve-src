// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { HistoricalRecordsComponent } from './historical-records.component';
import { RecordsService } from '../../../core/services/records.service';
import { HistoricalRecordDto } from '../../../core/models/record.model';

describe('HistoricalRecordsComponent', () => {
  let component: HistoricalRecordsComponent;
  let mockRecordsService: {
    getHistoricalMilestones: any;
  };

  const sampleMilestones: HistoricalRecordDto[] = [
    {
      id: 'rec-hr-single-season',
      category: 'batting',
      label: 'Más Jonrones en una Temporada',
      value: '21',
      holder: 'Alex Cabrera',
      year: '2013-14',
      team: 'Tiburones de La Guaira',
    },
    {
      id: 'rec-avg-single-season',
      category: 'batting',
      label: 'Promedio de Bateo Más Alto',
      value: '.430',
      holder: 'Alí Castillo',
      year: '2020-21',
      team: 'Águilas del Zulia',
    },
  ];

  beforeEach(() => {
    mockRecordsService = {
      getHistoricalMilestones: vi.fn().mockReturnValue(of(sampleMilestones)),
    };

    const injector = Injector.create({
      providers: [
        HistoricalRecordsComponent,
        { provide: RecordsService, useValue: mockRecordsService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    component = injector.get(HistoricalRecordsComponent);
  });

  it('should be created with initial idle state', () => {
    expect(component).toBeTruthy();
    expect(component.records()).toEqual([]);
    expect(component.isLoading()).toBe(false);
    expect(component.hasLoaded()).toBe(false);
  });

  it('should load records from service and update signals', () => {
    component.loadRecords();

    expect(mockRecordsService.getHistoricalMilestones).toHaveBeenCalledTimes(1);
    expect(component.records()).toEqual(sampleMilestones);
    expect(component.isLoading()).toBe(false);
    expect(component.hasLoaded()).toBe(true);
  });

  it('should not perform redundant network calls if records have already loaded', () => {
    component.loadRecords();
    expect(mockRecordsService.getHistoricalMilestones).toHaveBeenCalledTimes(1);

    component.loadRecords();
    expect(mockRecordsService.getHistoricalMilestones).toHaveBeenCalledTimes(1);
  });

  it('should gracefully handle service error and reset loading state', () => {
    mockRecordsService.getHistoricalMilestones.mockReturnValueOnce(
      throwError(() => new Error('Network error')),
    );

    component.loadRecords();

    expect(component.isLoading()).toBe(false);
    expect(component.hasLoaded()).toBe(true);
    expect(component.records()).toEqual([]);
  });

  it('should set up IntersectionObserver in browser platform if observer is available', () => {
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    class MockIntersectionObserver {
      constructor(public callback: any, public options: any) {}
      observe = observeMock;
      disconnect = disconnectMock;
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    // Mock recordsViewport nativeElement
    const dummyElement = document.createElement('section');
    (component as any).recordsViewport = vi.fn().mockReturnValue({ nativeElement: dummyElement });

    component.ngAfterViewInit();

    expect(observeMock).toHaveBeenCalledWith(dummyElement);

    component.ngOnDestroy();
    expect(disconnectMock).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
