import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CommitLeaderRowDto {
  @ApiProperty({ description: 'Normalized season code', example: '1946-46' })
  @IsString()
  @IsNotEmpty()
  seasonCode: string;

  @ApiProperty({ description: 'Start year of the season', example: 1946 })
  @IsInt()
  startYear: number;

  @ApiProperty({ description: 'End year of the season', example: 1946 })
  @IsInt()
  endYear: number;

  @ApiProperty({ description: 'Player full name', example: 'Jesús Ramos' })
  @IsString()
  @IsNotEmpty()
  playerName: string;

  @ApiProperty({ description: 'Player unique slug', example: 'jesus-ramos' })
  @IsString()
  @IsNotEmpty()
  playerSlug: string;

  @ApiProperty({ description: 'Raw team label', example: 'Magallanes' })
  @IsString()
  @IsNotEmpty()
  teamRaw: string;

  @ApiProperty({ enum: StatCategory, description: 'Statistical category', example: StatCategory.BATTING_AVERAGE })
  @IsEnum(StatCategory)
  category: StatCategory;

  @ApiProperty({ description: 'Numeric stat value', example: 0.403 })
  @IsNumber()
  statValue: number;

  @ApiPropertyOptional({ description: 'Additional contextual attributes', example: { jj: 30, vb: 120, h: 48 } })
  @IsOptional()
  @IsObject()
  extraAttributes?: Record<string, any>;
}

export class CommitImportDto {
  @ApiProperty({ enum: StatCategory, description: 'Target statistical category', example: StatCategory.BATTING_AVERAGE })
  @IsEnum(StatCategory)
  category: StatCategory;

  @ApiProperty({ type: [CommitLeaderRowDto], description: 'Array of validated rows to commit' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommitLeaderRowDto)
  rows: CommitLeaderRowDto[];
}

export class CommitResultDto {
  @ApiProperty({ description: 'Whether the transaction succeeded', example: true })
  success: boolean;

  @ApiProperty({ description: 'Total records committed in this transaction', example: 50 })
  totalProcessed: number;

  @ApiProperty({ description: 'Number of brand new records inserted', example: 45 })
  insertedCount: number;

  @ApiProperty({ description: 'Number of existing records updated (idempotent upsert)', example: 5 })
  updatedCount: number;

  @ApiProperty({ description: 'Status message', example: '50 records successfully committed to PostgreSQL.' })
  message: string;
}
