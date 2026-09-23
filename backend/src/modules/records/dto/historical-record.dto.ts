import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type RecordCategory = 'batting' | 'pitching' | 'general';

export class HistoricalRecordDto {
  @ApiProperty({
    description: 'Unique milestone record identifier',
    example: 'rec-hr-single-season',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Broad statistical category classification',
    enum: ['batting', 'pitching', 'general'],
    example: 'batting',
  })
  @IsEnum(['batting', 'pitching', 'general'])
  category: RecordCategory;

  @ApiProperty({
    description: 'Milestone metric description or title',
    example: 'Más Jonrones en una Temporada',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Numeric or formatted value of the historical mark',
    example: '21',
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: 'Name of the legendary player holding the milestone',
    example: 'Alex Cabrera',
  })
  @IsString()
  @IsNotEmpty()
  holder: string;

  @ApiProperty({
    description: 'Championship season or year span the mark was established',
    example: '2013-14',
  })
  @IsString()
  @IsNotEmpty()
  year: string;

  @ApiPropertyOptional({
    description: 'Franchise or team name',
    example: 'Tiburones de La Guaira',
  })
  @IsString()
  @IsOptional()
  team?: string;

  @ApiPropertyOptional({
    description: 'Timestamp of the record audit or validation',
    example: '2026-09-23T00:00:00.000Z',
  })
  @IsString()
  @IsOptional()
  updatedAt?: string;
}
