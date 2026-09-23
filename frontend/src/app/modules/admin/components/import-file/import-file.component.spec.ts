// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatDialog } from '@angular/material/dialog';
import { ImportFileComponent } from './import-file.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ImportsService } from '../../../../core/services/imports.service';
import { ValidationPreviewDto, CommitResultDto } from '../../../../core/models/import.model';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

describe('ImportFileComponent', () => {
  let component: ImportFileComponent;
  let injector: Injector;

  let authServiceMock: {
    isAdmin: ReturnType<typeof vi.fn>;
  };

  let importsServiceMock: {
    verifyFileMagicNumber: ReturnType<typeof vi.fn>;
    previewFile: ReturnType<typeof vi.fn>;
    commitImport: ReturnType<typeof vi.fn>;
  };

  let matDialogMock: {
    open: ReturnType<typeof vi.fn>;
  };

  const samplePreview: ValidationPreviewDto = {
    fileName: 'lider-bate.xlsx',
    category: 'BATTING_AVERAGE',
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
        category: 'BATTING_AVERAGE',
        statValue: 0.403,
        status: 'VALID',
      },
    ],
  };

  beforeEach(() => {
    authServiceMock = {
      isAdmin: vi.fn().mockReturnValue(true),
    };

    importsServiceMock = {
      verifyFileMagicNumber: vi.fn().mockResolvedValue(true),
      previewFile: vi.fn().mockReturnValue(of(samplePreview)),
      commitImport: vi.fn().mockReturnValue(
        of({
          success: true,
          totalProcessed: 1,
          insertedCount: 1,
          updatedCount: 0,
          message: 'Saved successfully',
        } as CommitResultDto),
      ),
    };

    matDialogMock = {
      open: vi.fn(),
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ImportsService, useValue: importsServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
      ],
    });

    component = runInInjectionContext(injector, () => new ImportFileComponent());
  });

  it('should create the import file component', () => {
    expect(component).toBeTruthy();
  });

  describe('processIncomingFile security checks', () => {
    it('rejects files with non-Excel extension', async () => {
      const badFile = new File(['content'], 'script.sh', { type: 'text/x-sh' });
      await component.processIncomingFile(badFile);

      expect(component.file()).toBeNull();
      expect(component.errorMessage()).toContain('Formato de archivo rechazado');
    });

    it('rejects files exceeding 8 MB size limit', async () => {
      const largeFile = new File([''], 'huge.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      Object.defineProperty(largeFile, 'size', { value: 9 * 1024 * 1024 });

      await component.processIncomingFile(largeFile);

      expect(component.file()).toBeNull();
      expect(component.errorMessage()).toContain('excede el límite máximo de 8 MB');
    });

    it('rejects files with invalid binary signatures', async () => {
      importsServiceMock.verifyFileMagicNumber.mockResolvedValueOnce(false);

      const fakeFile = new File(['bad-content'], 'fake.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await component.processIncomingFile(fakeFile);

      expect(component.file()).toBeNull();
      expect(component.errorMessage()).toContain('Firma binaria inválida');
    });

    it('accepts genuine Excel file with valid magic number', async () => {
      importsServiceMock.verifyFileMagicNumber.mockResolvedValueOnce(true);

      const genuineFile = new File(['valid-zip-content'], 'lider-bate.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      Object.defineProperty(genuineFile, 'size', { value: 25000 });

      await component.processIncomingFile(genuineFile);

      expect(component.file()).toBe(genuineFile);
      expect(component.errorMessage()).toBeNull();
      expect(component.canValidate()).toBe(true);
    });
  });

  describe('validateFileOnServer', () => {
    it('calls importsService.previewFile and updates previewData signal', () => {
      const genuineFile = new File(['valid'], 'lider-bate.xlsx');
      component.file.set(genuineFile);

      component.validateFileOnServer();

      expect(importsServiceMock.previewFile).toHaveBeenCalledWith(genuineFile);
      expect(component.previewData()).toEqual(samplePreview);
      expect(component.isValidating()).toBe(false);
    });

    it('handles server preview error', () => {
      importsServiceMock.previewFile.mockReturnValueOnce(
        throwError(() => ({ error: { message: 'Missing required columns: Equipo' } })),
      );

      const file = new File(['valid'], 'lider-bate.xlsx');
      component.file.set(file);

      component.validateFileOnServer();

      expect(component.previewData()).toBeNull();
      expect(component.errorMessage()).toContain('Missing required columns: Equipo');
      expect(component.isValidating()).toBe(false);
    });
  });

  describe('onCommitRecords', () => {
    it('calls importsService.commitImport, resets preview, sets successMessage, and opens ConfirmationModalComponent', () => {
      component.previewData.set(samplePreview);

      component.onCommitRecords(samplePreview.rows);

      expect(importsServiceMock.commitImport).toHaveBeenCalled();
      expect(component.previewData()).toBeNull();
      expect(component.file()).toBeNull();
      expect(component.successMessage()).toContain('Saved successfully');
      expect(matDialogMock.open).toHaveBeenCalledWith(
        ConfirmationModalComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            success: true,
            totalProcessed: 1,
            insertedCount: 1,
          }),
        }),
      );
    });

    it('handles commit failure and opens ConfirmationModalComponent with error payload', () => {
      importsServiceMock.commitImport.mockReturnValueOnce(
        throwError(() => ({ error: { message: 'Database constraint violation' } })),
      );

      component.previewData.set(samplePreview);
      component.onCommitRecords(samplePreview.rows);

      expect(component.errorMessage()).toContain('Database constraint violation');
      expect(matDialogMock.open).toHaveBeenCalledWith(
        ConfirmationModalComponent,
        expect.objectContaining({
          data: expect.objectContaining({
            success: false,
            message: 'Database constraint violation',
          }),
        }),
      );
    });
  });

  describe('onDiscardPreview', () => {
    it('clears previewData and returns back to dropzone', () => {
      component.previewData.set(samplePreview);
      component.onDiscardPreview();

      expect(component.previewData()).toBeNull();
    });
  });
});
