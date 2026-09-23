import { StatCategory } from './leaderboard.model';

export type ValidationStatus = 'VALID' | 'DUPLICATE' | 'ERROR';

export interface ValidationPreviewRowDto {
  rowNumber: number;
  seasonCode: string;
  startYear: number;
  endYear: number;
  playerName: string;
  playerSlug: string;
  teamRaw: string;
  canonicalTeam: string | null;
  category: StatCategory;
  statValue: number;
  extraAttributes?: Record<string, any>;
  status: ValidationStatus;
  validationMessage?: string;
}

export interface ValidationSummaryDto {
  total: number;
  valid: number;
  duplicates: number;
  errors: number;
}

export interface ValidationPreviewDto {
  fileName: string;
  category: StatCategory;
  summary: ValidationSummaryDto;
  rows: ValidationPreviewRowDto[];
}

export interface CommitLeaderRowDto {
  seasonCode: string;
  startYear: number;
  endYear: number;
  playerName: string;
  playerSlug: string;
  teamRaw: string;
  category: StatCategory;
  statValue: number;
  extraAttributes?: Record<string, any>;
}

export interface CommitImportDto {
  category: StatCategory;
  rows: CommitLeaderRowDto[];
}

export interface CommitResultDto {
  success: boolean;
  totalProcessed: number;
  insertedCount: number;
  updatedCount: number;
  message: string;
}
