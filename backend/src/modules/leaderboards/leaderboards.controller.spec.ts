import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardsController } from './leaderboards.controller';
import { LeaderboardImportService } from './leaderboard-import.service';
import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { Reflector } from '@nestjs/core';

describe('LeaderboardsController', () => {
  let controller: LeaderboardsController;
  let serviceMock: any;
  let reflector: Reflector;

  beforeEach(async () => {
    serviceMock = {
      processUploadedFiles: jest.fn().mockResolvedValue({
        success: true,
        totalFiles: 1,
        processedFiles: 1,
        totalRecordsProcessed: 10,
        totalRecordsInserted: 10,
        totalRecordsUpdated: 0,
        fileSummaries: [],
        errors: [],
      }),
      getLeaders: jest.fn().mockResolvedValue({
        total: 1,
        limit: 50,
        offset: 0,
        records: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardsController],
      providers: [
        {
          provide: LeaderboardImportService,
          useValue: serviceMock,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<LeaderboardsController>(LeaderboardsController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Security & Role Restrictions', () => {
    it('should have ADMIN role metadata on import endpoint', () => {
      const roles = reflector.get<Role[]>(ROLES_KEY, controller.importLeaderboards);
      expect(roles).toBeDefined();
      expect(roles).toContain(Role.ADMIN);
    });
  });

  describe('importLeaderboards', () => {
    it('throws BadRequestException if files array is empty or undefined', async () => {
      await expect(controller.importLeaderboards([])).rejects.toThrow(BadRequestException);
      await expect(controller.importLeaderboards(null as any)).rejects.toThrow(BadRequestException);
    });

    it('delegates valid uploaded files to LeaderboardImportService', async () => {
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'files',
          originalname: 'lider-bate.xlsx',
          encoding: '7bit',
          mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          buffer: Buffer.from('mock-bytes'),
          size: 10,
          stream: null as any,
          destination: '',
          filename: '',
          path: '',
        },
      ];

      const result = await controller.importLeaderboards(mockFiles);
      expect(serviceMock.processUploadedFiles).toHaveBeenCalledWith(mockFiles);
      expect(result.success).toBe(true);
      expect(result.totalFiles).toBe(1);
    });
  });

  describe('getLeaders', () => {
    it('delegates query parameters to service', async () => {
      const query = { limit: 10, offset: 0 };
      const res = await controller.getLeaders(query);
      expect(serviceMock.getLeaders).toHaveBeenCalledWith(query);
      expect(res.total).toBe(1);
    });
  });
});
