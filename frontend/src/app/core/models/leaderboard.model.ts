export type StatCategory =
  | 'BATTING_AVERAGE'
  | 'HITS'
  | 'DOUBLES'
  | 'TRIPLES'
  | 'HOME_RUNS'
  | 'RUNS';

export interface FileImportSummary {
  fileName: string;
  category: string;
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  warnings?: string[];
}

export interface ImportResult {
  success: boolean;
  totalFiles: number;
  processedFiles: number;
  totalRecordsProcessed: number;
  totalRecordsInserted: number;
  totalRecordsUpdated: number;
  fileSummaries: FileImportSummary[];
  errors: string[];
}

export interface LeaderRecord {
  id: string;
  season: string;
  startYear: number;
  endYear: number;
  player: string;
  playerSlug: string;
  teamRaw: string;
  canonicalTeam: string | null;
  category: StatCategory;
  statValue: number;
  extraAttributes?: Record<string, any>;
  createdAt: string;
}

export interface LeaderQueryResponse {
  total: number;
  limit: number;
  offset: number;
  records: LeaderRecord[];
}
