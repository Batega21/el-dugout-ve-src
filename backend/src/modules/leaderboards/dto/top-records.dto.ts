import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object representing an individual statistic record item in the stats strip.
 */
export class TopRecordItemDto {
  @ApiProperty({
    description: 'Category label or title of the statistical record',
    example: 'Récord AVG',
  })
  label: string;

  @ApiProperty({
    description: 'Formatted record metric value, player name, and season code',
    example: '.430 — Alí Castillo 2020-21',
  })
  value: string;
}
