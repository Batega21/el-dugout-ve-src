/**
 * Interface definition for a single statistic record item in the stats strip marquee.
 */
export interface StatRecordItem {
  label: string;
  value: string;
}

/**
 * Default top record items of each category in the Venezuelan Professional Baseball League (LVBP).
 */
export const DEFAULT_STAT_RECORDS: StatRecordItem[] = [
  { label: 'Récord AVG', value: '.430 — Alí Castillo 2020-21' },
  { label: 'Récord Innings', value: '208.0 — Emilio Cueche 1953-54' },
  { label: 'Récord Triples', value: '10 — Félix Rodríguez 1976-77' },
  { label: 'Más títulos bateo', value: '6x — Luis Sojo' },
  { label: 'Temporadas registradas', value: '80 Temporadas LVBP' },
];
