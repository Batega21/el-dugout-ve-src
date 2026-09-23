import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecordsService } from './records.service';
import { HistoricalRecordDto } from './dto/historical-record.dto';

@ApiTags('Records')
@Controller(['v1/records', 'records'])
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get('historical-milestones')
  @ApiOperation({
    summary: 'Retrieve historical LVBP milestones and all-time records',
    description:
      'Extracts validated top individual baseball record holders aggregated from PostgreSQL (home runs, batting average, hits, triples, innings pitched, strikeouts, batting titles, saves).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historical records successfully retrieved.',
    type: [HistoricalRecordDto],
  })
  async getHistoricalMilestones(): Promise<HistoricalRecordDto[]> {
    return this.recordsService.getHistoricalMilestones();
  }
}
