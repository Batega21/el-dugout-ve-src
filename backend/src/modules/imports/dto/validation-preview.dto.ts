import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatCategory } from '@prisma/client';

export type ValidationStatus = 'VALID' | 'DUPLICATE' | 'ERROR';

export class ValidationPreviewRowDto {
  @ApiProperty({ description: 'Row index in the spreadsheet', example: 2 })
  rowNumber: number;

  @ApiProperty({ description: 'Normalized season code', example: '1946-46' })
  seasonCode: string;

  @ApiProperty({ description: 'Start year of the season', example: 1946 })
  startYear: number;

  @ApiProperty({ description: 'End year of the season', example: 1946 })
  endYear: number;

  @ApiProperty({ description: 'Player full name extracted from row', example: 'Jesús Ramos' })
  playerName: string;

  @ApiProperty({ description: 'Generated unique player slug', example: 'jesus-ramos' })
  playerSlug: string;

  @ApiProperty({ description: 'Raw team label from row', example: 'Magallanes' })
  teamRaw: string;

  @ApiProperty({ description: 'Resolved canonical team name if matched', example: 'Navegantes del Magallanes', nullable: true })
  canonicalTeam: string | null;

  @ApiProperty({ enum: StatCategory, description: 'Statistical category for the metric', example: StatCategory.BATTING_AVERAGE })
  category: StatCategory;

  @ApiProperty({ description: 'Numeric stat value', example: 0.403 })
  statValue: number;

  @ApiPropertyOptional({ description: 'Additional contextual metrics (e.g. JJ, VB, H)', example: { jj: 30, vb: 120, h: 48 } })
  extraAttributes?: Record<string, any>;

  @ApiProperty({ enum: ['VALID', 'DUPLICATE', 'ERROR'], description: 'Validation outcome status', example: 'VALID' })
  status: ValidationStatus;

  @ApiPropertyOptional({ description: 'Human-readable validation explanation or error message', example: 'Clean record ready to commit' })
  validationMessage?: string;
}

export class ValidationSummaryDto {
  @ApiProperty({ description: 'Total data rows evaluated', example: 50 })
  total: number;

  @ApiProperty({ description: 'Total valid records ready for insertion', example: 45 })
  valid: number;

  @ApiProperty({ description: 'Total duplicate records conflicting with existing database rows', example: 5 })
  duplicates: number;

  @ApiProperty({ description: 'Total malformed or invalid rows rejected', example: 0 })
  errors: number;
}

export class ValidationPreviewDto {
  @ApiProperty({ description: 'Name of the analyzed spreadsheet file', example: 'lider-bate.xlsx' })
  fileName: string;

  @ApiProperty({ enum: StatCategory, description: 'Detected statistical category', example: StatCategory.BATTING_AVERAGE })
  category: StatCategory;

  @ApiProperty({ type: () => ValidationSummaryDto, description: 'Aggregated validation telemetry' })
  summary: ValidationSummaryDto;

  @ApiProperty({ type: () => [ValidationPreviewRowDto], description: 'Detailed rows with individual validation statuses' })
  rows: ValidationPreviewRowDto[];
}
