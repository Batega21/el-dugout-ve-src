// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  ValidationTableComponent,
  DEFAULT_VALIDATION_PREVIEW,
} from './validation-table.component';
import { ValidationPreviewDto } from '../../../../core/models/import.model';

const mockPreview: ValidationPreviewDto = {
  fileName: 'lider-bate.xlsx',
  category: 'BATTING_AVERAGE',
  summary: {
    total: 3,
    valid: 2,
    duplicates: 1,
    errors: 0,
  },
  rows: [
    {
      rowNumber: 2,
      seasonCode: '1946-46',
      startYear: 1946,
      endYear: 1946,
      playerName: 'Pablo Garcia',
      playerSlug: 'pablo-garcia',
      teamRaw: 'Magallanes',
      canonicalTeam: 'Navegantes del Magallanes',
      category: 'BATTING_AVERAGE',
      statValue: 0.403,
      status: 'VALID',
    },
    {
      rowNumber: 3,
      seasonCode: '1946-47',
      startYear: 1946,
      endYear: 1947,
      playerName: 'Guillermo Vento',
      playerSlug: 'guillermo-vento',
      teamRaw: 'Ara-Zul',
      canonicalTeam: null,
      category: 'BATTING_AVERAGE',
      statValue: 0.385,
      status: 'VALID',
    },
    {
      rowNumber: 4,
      seasonCode: '1946-46',
      startYear: 1946,
      endYear: 1946,
      playerName: 'Jesús Ramos',
      playerSlug: 'jesus-ramos',
      teamRaw: 'Magallanes',
      canonicalTeam: 'Navegantes del Magallanes',
      category: 'BATTING_AVERAGE',
      statValue: 0.403,
      status: 'DUPLICATE',
      validationMessage: 'Already exists in DB',
    },
  ],
};

describe('ValidationTableComponent', () => {
  let component: ValidationTableComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [] });
    component = runInInjectionContext(injector, () => new ValidationTableComponent());
  });

  it('should create the validation table component', () => {
    expect(component).toBeTruthy();
  });

  it('initializes with default validation preview', () => {
    expect(component.preview()).toEqual(DEFAULT_VALIDATION_PREVIEW);
  });

  it('formats batting average metrics to 3 decimal places without leading zero', () => {
    expect(component.formatMetric(0.403)).toBe('.403');
    expect(component.formatMetric(0.35)).toBe('.350');
  });

  it('formats non-average metrics as regular numbers', () => {
    expect(component.formatMetric(15)).toBe('15');
    expect(component.formatMetric(0)).toBe('0');
  });

  it('updates active filter when setFilter is called', () => {
    expect(component.activeFilter()).toBe('ALL');
    component.setFilter('DUPLICATE');
    expect(component.activeFilter()).toBe('DUPLICATE');
    component.setFilter('VALID');
    expect(component.activeFilter()).toBe('VALID');
  });

  it('emits discard event when onDiscard is invoked', () => {
    let discardEmitted = false;
    component.discard.subscribe(() => {
      discardEmitted = true;
    });

    component.onDiscard();
    expect(discardEmitted).toBe(true);
  });
});
