import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileImportSummaryDto {
  @ApiProperty({ description: 'Original uploaded file name', example: 'lider-bate.xlsx' })
  fileName: string;

  @ApiProperty({ description: 'Detected statistical category', example: 'BATTING_AVERAGE' })
  category: string;

  @ApiProperty({ description: 'Total valid data rows extracted from the sheet', example: 78 })
  totalRows: number;

  @ApiProperty({ description: 'New records inserted into the database', example: 75 })
  insertedCount: number;

  @ApiProperty({ description: 'Existing records updated (idempotent)', example: 3 })
  updatedCount: number;

  @ApiProperty({ description: 'File processing outcome', example: 'SUCCESS', enum: ['SUCCESS', 'PARTIAL', 'FAILED'] })
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';

  @ApiPropertyOptional({ description: 'Non-fatal parsing warnings or notices', type: [String] })
  warnings?: string[];
}

export class ImportResultDto {
  @ApiProperty({ description: 'Overall execution success flag', example: true })
  success: boolean;

  @ApiProperty({ description: 'Total number of uploaded files', example: 6 })
  totalFiles: number;

  @ApiProperty({ description: 'Number of successfully parsed and processed files', example: 6 })
  processedFiles: number;

  @ApiProperty({ description: 'Total data rows processed across all sheets', example: 450 })
  totalRecordsProcessed: number;

  @ApiProperty({ description: 'Total new records created across all entities', example: 420 })
  totalRecordsInserted: number;

  @ApiProperty({ description: 'Total existing records idempotently refreshed', example: 30 })
  totalRecordsUpdated: number;

  @ApiProperty({ description: 'Detailed summary breakdown per file', type: [FileImportSummaryDto] })
  fileSummaries: FileImportSummaryDto[];

  @ApiProperty({ description: 'Error messages encountered during ingestion', type: [String] })
  errors: string[];
}
