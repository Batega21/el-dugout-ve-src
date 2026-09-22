import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { StatsStripComponent } from './stats-strip.component';
import { DEFAULT_STAT_RECORDS, StatRecordItem } from './stats-strip.interface';

describe('StatsStripComponent', () => {
  let component: StatsStripComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [] });
    component = runInInjectionContext(injector, () => new StatsStripComponent());
  });

  it('should create the stats strip component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with DEFAULT_STAT_RECORDS', () => {
    expect(component.items()).toEqual(DEFAULT_STAT_RECORDS);
    expect(component.items().length).toBe(5);
  });

  it('should duplicate items for seamless -50% marquee looping', () => {
    expect(component.duplicatedItems().length).toBe(10);
    expect(component.duplicatedItems()[0]).toEqual(DEFAULT_STAT_RECORDS[0]);
    expect(component.duplicatedItems()[5]).toEqual(DEFAULT_STAT_RECORDS[0]);
  });

  it('should include all required top LVBP records in default configuration', () => {
    const labels = component.items().map((i) => i.label);
    expect(labels).toContain('Récord AVG');
    expect(labels).toContain('Récord Innings');
    expect(labels).toContain('Récord Triples');
    expect(labels).toContain('Más títulos bateo');
    expect(labels).toContain('Temporadas registradas');

    const avgRecord = component.items().find((i) => i.label === 'Récord AVG');
    expect(avgRecord?.value).toBe('.430 — Alí Castillo 2020-21');

    const inningsRecord = component.items().find((i) => i.label === 'Récord Innings');
    expect(inningsRecord?.value).toBe('208.0 — Emilio Cueche 1953-54');

    const triplesRecord = component.items().find((i) => i.label === 'Récord Triples');
    expect(triplesRecord?.value).toBe('10 — Félix Rodríguez 1976-77');

    const titlesRecord = component.items().find((i) => i.label === 'Más títulos bateo');
    expect(titlesRecord?.value).toBe('6x — Luis Sojo');

    const seasonsRecord = component.items().find((i) => i.label === 'Temporadas registradas');
    expect(seasonsRecord?.value).toBe('80 Temporadas LVBP');
  });

  it('should accept custom items and compute duplicatedItems correctly', () => {
    const custom: StatRecordItem[] = [
      { label: 'Jonrones', value: '28 — Alex Cabrera 2013-14' },
    ];
    (component as any).items = signal(custom);
    expect(component.duplicatedItems().length).toBe(2);
    expect(component.duplicatedItems()[0].value).toBe('28 — Alex Cabrera 2013-14');
    expect(component.duplicatedItems()[1].value).toBe('28 — Alex Cabrera 2013-14');
  });

  it('should return empty duplicatedItems when items is empty', () => {
    (component as any).items = signal([]);
    expect(component.duplicatedItems()).toEqual([]);
  });

  it('should have fullWidth enabled by default', () => {
    expect(component.fullWidth()).toBe(true);
  });
});
