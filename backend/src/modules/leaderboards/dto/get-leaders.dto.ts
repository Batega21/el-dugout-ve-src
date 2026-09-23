import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatCategory } from '@prisma/client';

export class GetLeadersQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by statistical category',
    enum: StatCategory,
    example: StatCategory.BATTING_AVERAGE,
  })
  @IsOptional()
  @IsEnum(StatCategory)
  category?: StatCategory;

  @ApiPropertyOptional({
    description: 'Filter by season code (e.g. 1946-46, 2025-26)',
    example: '2025-26',
  })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({
    description: 'Pagination limit',
    example: 50,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Pagination offset',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
