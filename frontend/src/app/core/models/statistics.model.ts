export type BattingCategory = 'HR' | 'H' | 'AVG' | 'SB';
export type PitchingCategory = 'W' | 'SO' | 'SV';
export type SortDirection = 'asc' | 'desc';
export type PageSizeOption = 10 | 20 | 50;

export interface BasePlayerStat {
  id: string;
  rank: number;
  player: string;
  seasons: string;
  startYear: number;
  endYear: number;
  teams: string[];
}

export interface BattingPlayerStat extends BasePlayerStat {
  games: number;          // JJ / G
  atBats: number;         // VB / AB
  homeRuns: number;       // HR
  hits: number;           // H
  avg: string;            // AVG (formatted, e.g. ".312")
  avgValue: number;       // AVG numeric for sorting
  stolenBases: number;    // SB
  value: number;          // Active metric value for sorting
  formattedValue: string; // Formatted value display
}

export interface PitchingPlayerStat extends BasePlayerStat {
  inningsPitched: string; // EL / IP (e.g. "1,245.1")
  ipValue: number;        // IP numeric for sorting
  era: string;            // EFE / ERA (e.g. "3.15")
  eraValue: number;       // ERA numeric for sorting
  wins: number;           // W / JG
  strikeouts: number;     // SO / K
  saves: number;          // SV / JS
  value: number;          // Active metric value for sorting
  formattedValue: string; // Formatted value display
}

export interface CategoryTab<T extends string = string> {
  id: T;
  labelKey: string;
  metricLabelKey: string;
  shortCode: string;
}
