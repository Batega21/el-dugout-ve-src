// @vitest-environment jsdom
import '@angular/compiler';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportsService } from './imports.service';
import { ValidationPreviewDto, CommitImportDto } from '../models/import.model';

describe('ImportsService', () => {
  let service: ImportsService;
  let mockHttpClient: {
    post: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockHttpClient = {
      post: vi.fn().mockReturnValue(of({})),
      get: vi.fn().mockReturnValue(of({})),
    };

    const injector = Injector.create({
      providers: [
        ImportsService,
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });

    service = injector.get(ImportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('verifyFileMagicNumber', () => {
    it('returns true for XLSX binary signature (50 4B 03 04)', async () => {
      const zipBytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00]);
      const file = new File([zipBytes], 'sheet.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const isValid = await service.verifyFileMagicNumber(file);
      expect(isValid).toBe(true);
    });

    it('returns true for legacy XLS binary signature (D0 CF 11 E0)', async () => {
      const xlsBytes = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0x00]);
      const file = new File([xlsBytes], 'legacy.xls', {
        type: 'application/vnd.ms-excel',
      });

      const isValid = await service.verifyFileMagicNumber(file);
      expect(isValid).toBe(true);
    });

    it('returns false for executable masquerading files (4D 5A 90 00)', async () => {
      const exeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
      const file = new File([exeBytes], 'fake.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const isValid = await service.verifyFileMagicNumber(file);
      expect(isValid).toBe(false);
    });

    it('returns false for files with fewer than 4 bytes', async () => {
      const shortBytes = new Uint8Array([0x50, 0x4b]);
      const file = new File([shortBytes], 'tiny.xlsx');

      const isValid = await service.verifyFileMagicNumber(file);
      expect(isValid).toBe(false);
    });
  });

  describe('previewFile', () => {
    it('sends POST request to v1/imports/preview with FormData', () => {
      const mockFile = new File(['dummy'], 'sample.xlsx');
      const mockResponse: ValidationPreviewDto = {
        fileName: 'sample.xlsx',
        category: 'BATTING_AVERAGE',
        summary: { total: 1, valid: 1, duplicates: 0, errors: 0 },
        rows: [],
      };

      mockHttpClient.post.mockReturnValue(of(mockResponse));

      service.previewFile(mockFile).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        'v1/imports/preview',
        expect.any(FormData),
      );
    });
  });

  describe('commitImport', () => {
    it('sends POST request to v1/imports/commit with payload', () => {
      const commitPayload: CommitImportDto = {
        category: 'BATTING_AVERAGE',
        rows: [
          {
            seasonCode: '1946-46',
            startYear: 1946,
            endYear: 1946,
            playerName: 'Pablo Garcia',
            playerSlug: 'pablo-garcia',
            teamRaw: 'Magallanes',
            category: 'BATTING_AVERAGE',
            statValue: 0.403,
          },
        ],
      };

      const mockResult = {
        success: true,
        totalProcessed: 1,
        insertedCount: 1,
        updatedCount: 0,
        message: 'Committed successfully',
      };

      mockHttpClient.post.mockReturnValue(of(mockResult));

      service.commitImport(commitPayload).subscribe((res) => {
        expect(res).toEqual(mockResult);
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('v1/imports/commit', commitPayload);
    });
  });
});
