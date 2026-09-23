import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StatCategory } from '@prisma/client';
import { ImportsController } from './imports.controller';
import { LeaderboardImportService } from '../leaderboards/leaderboard-import.service';
import { ValidationPreviewDto } from './dto/validation-preview.dto';
import { CommitImportDto, CommitResultDto } from './dto/commit-import.dto';

describe('ImportsController', () => {
  let controller: ImportsController;
  let importServiceMock: Partial<Record<keyof LeaderboardImportService, jest.Mock>>;

  beforeEach(async () => {
    importServiceMock = {
      previewWorkbook: jest.fn(),
      commitValidatedRows: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportsController],
      providers: [
        {
          provide: LeaderboardImportService,
          useValue: importServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ImportsController>(ImportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('previewFile', () => {
    it('throws BadRequestException if no file is provided', async () => {
      await expect(controller.previewFile(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('delegates to LeaderboardImportService.previewWorkbook when file is provided', async () => {
      const mockPreviewResult: ValidationPreviewDto = {
        fileName: 'lider-bate.xlsx',
        category: StatCategory.BATTING_AVERAGE,
        summary: { total: 1, valid: 1, duplicates: 0, errors: 0 },
        rows: [
          {
            rowNumber: 2,
            seasonCode: '1946-46',
            startYear: 1946,
            endYear: 1946,
            playerName: 'Pablo Garcia',
            playerSlug: 'pablo-garcia',
            teamRaw: 'Magallanes',
            canonicalTeam: 'Navegantes del Magallanes',
            category: StatCategory.BATTING_AVERAGE,
            statValue: 0.403,
            status: 'VALID',
            validationMessage: 'Clean record ready to commit',
          },
        ],
      };

      (importServiceMock.previewWorkbook as jest.Mock).mockResolvedValue(mockPreviewResult);

      const fakeFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'lider-bate.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]),
        size: 6,
        stream: null as any,
        destination: '',
        filename: '',
        path: '',
      };

      const result = await controller.previewFile(fakeFile);
      expect(importServiceMock.previewWorkbook).toHaveBeenCalledWith(fakeFile);
      expect(result).toEqual(mockPreviewResult);
    });
  });

  describe('commitImport', () => {
    it('delegates to LeaderboardImportService.commitValidatedRows and returns commit result', async () => {
      const commitDto: CommitImportDto = {
        category: StatCategory.BATTING_AVERAGE,
        rows: [
          {
            seasonCode: '1946-46',
            startYear: 1946,
            endYear: 1946,
            playerName: 'Pablo Garcia',
            playerSlug: 'pablo-garcia',
            teamRaw: 'Magallanes',
            category: StatCategory.BATTING_AVERAGE,
            statValue: 0.403,
          },
        ],
      };

      const mockCommitResult: CommitResultDto = {
        success: true,
        totalProcessed: 1,
        insertedCount: 1,
        updatedCount: 0,
        message: 'Successfully committed 1 records (1 inserted, 0 updated).',
      };

      (importServiceMock.commitValidatedRows as jest.Mock).mockResolvedValue(mockCommitResult);

      const result = await controller.commitImport(commitDto);
      expect(importServiceMock.commitValidatedRows).toHaveBeenCalledWith(commitDto);
      expect(result).toEqual(mockCommitResult);
    });
  });
});
