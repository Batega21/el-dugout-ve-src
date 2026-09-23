import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { LeaderboardImportService } from '../leaderboards/leaderboard-import.service';
import { ValidationPreviewDto } from './dto/validation-preview.dto';
import { CommitImportDto, CommitResultDto } from './dto/commit-import.dto';

@ApiTags('Imports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller(['v1/imports', 'imports'])
export class ImportsController {
  constructor(private readonly leaderboardImportService: LeaderboardImportService) {}

  /**
   * Preview and dry-run validate an uploaded Excel spreadsheet.
   * Checks file signature, structure, formula injections, and database duplicate records.
   */
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Preview and validate an Excel file before committing (Admin only)',
    description:
      'Uploads an Excel spreadsheet (.xlsx, .xls) up to 8 MB. Performs client/server security checks, formula injection escaping, required column validation, and detects potential duplicate records in the database.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'The Excel workbook (.xlsx, .xls) to validate',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Workbook parsed and evaluated successfully.',
    type: ValidationPreviewDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid format, missing required columns, or binary signature mismatch.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: Requires ADMIN role.',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 8 * 1024 * 1024, // 8 MB hard limit
      },
      fileFilter: (_req, file, cb) => {
        const isExcel =
          file.originalname.match(/\.(xlsx|xls)$/i) ||
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel';

        if (!isExcel) {
          return cb(
            new BadRequestException(
              `File "${file.originalname}" is not an accepted Excel workbook. Only .xlsx and .xls formats are permitted.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async previewFile(@UploadedFile() file: Express.Multer.File): Promise<ValidationPreviewDto> {
    if (!file) {
      throw new BadRequestException('A file is required in the "file" field.');
    }
    return this.leaderboardImportService.previewWorkbook(file);
  }

  /**
   * Commit clean, validated records into the database inside an ACID transaction.
   */
  @Post('commit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Commit validated records into PostgreSQL (Admin only)',
    description:
      'Persists validated rows inside an atomic database transaction. Automatically rolls back if any record fails to insert.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Records committed successfully.',
    type: CommitResultDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Empty or invalid rows payload.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication token missing or invalid.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden: Requires ADMIN role.',
  })
  async commitImport(@Body() dto: CommitImportDto): Promise<CommitResultDto> {
    return this.leaderboardImportService.commitValidatedRows(dto);
  }
}
