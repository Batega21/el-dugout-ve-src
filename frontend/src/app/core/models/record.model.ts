export type RecordCategory = 'batting' | 'pitching' | 'general';

export interface HistoricalRecordDto {
  id: string;
  category: RecordCategory;
  label: string; // e.g., "Más Jonrones en una Temporada", "Más Ponches"
  value: string; // e.g., "21", ".416", "234"
  holder: string; // e.g., "Alex Cabrera", "Ugueth Urbina"
  year: string; // e.g., "2013-14"
  team?: string; // e.g., "Tiburones de La Guaira"
  updatedAt?: string;
}
