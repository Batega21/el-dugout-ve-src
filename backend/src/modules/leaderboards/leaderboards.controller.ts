import {
  Controller,
  Post,
  Get,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { LeaderboardImportService } from './leaderboard-import.service';
import { ImportResultDto } from './dto/import-result.dto';
import { GetLeadersQueryDto } from './dto/get-leaders.dto';

@ApiTags('Leaderboards')
@Controller('leaderboards')
export class LeaderboardsController {
  constructor(private readonly importService: LeaderboardImportService) {}

  /**
   * Upload and process historical LVBP leaderboard Excel workbooks.
   * Strictly restricted to administrators.
   */
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Import historical LVBP leaderboards from Excel files (Admin only)',
    description:
      'Uploads up to 10 Excel spreadsheets (.xlsx, .xls) containing batting averages, home runs, hits, doubles, triples, or runs scored. Records are normalized and idempotently upserted.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'One or more Excel files (.xlsx, .xls) to parse and ingest',
        },
      },
      required: ['files'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Workbooks parsed and ingested successfully.',
    type: ImportResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file format, empty upload, or unrecognizable header columns.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: caller lacks ADMIN privileges.',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB maximum per file
      },
      fileFilter: (_req, file, cb) => {
        const isExcel =
          file.originalname.match(/\.(xlsx|xls)$/i) ||
          file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel';

        if (!isExcel) {
          return cb(
            new BadRequestException(
              `File "${file.originalname}" is not an accepted Excel workbook. Only .xlsx and .xls formats are allowed.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async importLeaderboards(@UploadedFiles() files: Express.Multer.File[]): Promise<ImportResultDto> {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one Excel file must be uploaded under the "files" form field.');
    }
    return this.importService.processUploadedFiles(files);
  }

  /**
   * Retrieve historical leaderboard entries with optional filtering.
   */
  @Get('leaders')
  @ApiOperation({
    summary: 'Retrieve historical season leader records',
    description: 'Returns historical leaderboard entries filtered by category, season code, and pagination.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Leaderboard records successfully fetched.',
  })
  async getLeaders(@Query() query: GetLeadersQueryDto) {
    return this.importService.getLeaders(query);
  }
}
