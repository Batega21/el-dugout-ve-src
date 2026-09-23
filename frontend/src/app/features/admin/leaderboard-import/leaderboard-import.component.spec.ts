import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { LeaderboardImportComponent } from './leaderboard-import.component';
import { LeaderboardsService } from '../../../core/services/leaderboards.service';
import { AuthService } from '../../../core/services/auth.service';
import { ImportResult } from '../../../core/models/leaderboard.model';

describe('LeaderboardImportComponent', () => {
  let component: LeaderboardImportComponent;
  let injector: Injector;

  let mockAuthService: {
    isAdmin: ReturnType<typeof signal<boolean>>;
  };

  let mockLeaderboardsService: {
    uploadFiles: any;
    detectCategoryPreview: any;
  };

  const fakeExcelFile = new File(['mock-content'], 'lider-bate.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const mockImportResult: ImportResult = {
    success: true,
    totalFiles: 1,
    processedFiles: 1,
    totalRecordsProcessed: 15,
    totalRecordsInserted: 12,
    totalRecordsUpdated: 3,
    fileSummaries: [
      {
        fileName: 'lider-bate.xlsx',
        category: 'BATTING_AVERAGE',
        totalRows: 15,
        insertedCount: 12,
        updatedCount: 3,
        status: 'SUCCESS',
      },
    ],
    errors: [],
  };

  beforeEach(() => {
    mockAuthService = {
      isAdmin: signal<boolean>(true),
    };

    mockLeaderboardsService = {
      uploadFiles: vi.fn().mockReturnValue(
        of(new HttpResponse<ImportResult>({ body: mockImportResult })),
      ),
      detectCategoryPreview: vi.fn().mockImplementation((name: string) => {
        if (name.includes('bate')) return { label: 'Batting Average', category: 'BATTING_AVERAGE' };
        return { label: 'Excel Dataset', category: 'UNKNOWN' };
      }),
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LeaderboardsService, useValue: mockLeaderboardsService },
      ],
    });

    component = runInInjectionContext(injector, () => new LeaderboardImportComponent());
  });

  it('should initialize with default states', () => {
    expect(component).toBeTruthy();
    expect(component.files().length).toBe(0);
    expect(component.isDragging()).toBe(false);
    expect(component.isUploading()).toBe(false);
    expect(component.uploadProgress()).toBe(0);
    expect(component.importResult()).toBeNull();
    expect(component.canUpload()).toBe(false);
  });

  describe('Drag & Drop Interactions', () => {
    it('sets isDragging to true on dragover and false on dragleave', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as DragEvent;

      component.onDragOver(mockEvent);
      expect(component.isDragging()).toBe(true);

      component.onDragLeave(mockEvent);
      expect(component.isDragging()).toBe(false);
    });

    it('processes dropped valid Excel files and resets drag state', () => {
      const dropEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [fakeExcelFile],
        },
      } as unknown as DragEvent;

      component.onDrop(dropEvent);

      expect(component.isDragging()).toBe(false);
      expect(component.files().length).toBe(1);
      expect(component.files()[0].name).toBe('lider-bate.xlsx');
      expect(component.validationErrors().length).toBe(0);
      expect(component.canUpload()).toBe(true);
    });

    it('rejects unsupported file extensions on drop with validation notice', () => {
      const invalidFile = new File(['text'], 'report.pdf', { type: 'application/pdf' });
      const dropEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        dataTransfer: {
          files: [invalidFile],
        },
      } as unknown as DragEvent;

      component.onDrop(dropEvent);

      expect(component.files().length).toBe(0);
      expect(component.validationErrors().length).toBe(1);
      expect(component.validationErrors()[0]).toContain('Only Excel files');
    });
  });

  describe('Staged Queue Management', () => {
    it('computes staged file preview details including formatted size and category label', () => {
      component.files.set([fakeExcelFile]);
      const staged = component.stagedFiles();

      expect(staged.length).toBe(1);
      expect(staged[0].name).toBe('lider-bate.xlsx');
      expect(staged[0].categoryLabel).toBe('Batting Average');
      expect(staged[0].formattedSize).toBeDefined();
    });

    it('removes an individual file from the queue', () => {
      const file2 = new File(['content'], 'lider-homerun.xlsx');
      component.files.set([fakeExcelFile, file2]);

      component.removeFile(fakeExcelFile);

      expect(component.files().length).toBe(1);
      expect(component.files()[0].name).toBe('lider-homerun.xlsx');
    });

    it('clears all files from the queue', () => {
      component.files.set([fakeExcelFile]);
      component.clearAllFiles();

      expect(component.files().length).toBe(0);
      expect(component.canUpload()).toBe(false);
    });
  });

  describe('Upload Pipeline Execution', () => {
    it('executes upload and sets import results on success', () => {
      component.files.set([fakeExcelFile]);

      component.startUpload();

      expect(mockLeaderboardsService.uploadFiles).toHaveBeenCalledWith([fakeExcelFile]);
      expect(component.isUploading()).toBe(false);
      expect(component.uploadProgress()).toBe(100);
      expect(component.importResult()).toEqual(mockImportResult);
      expect(component.files().length).toBe(0);
    });

    it('updates uploadProgress when progress events arrive', () => {
      mockLeaderboardsService.uploadFiles.mockReturnValue(
        of({
          type: HttpEventType.UploadProgress,
          loaded: 50,
          total: 100,
        }),
      );

      component.files.set([fakeExcelFile]);
      component.startUpload();

      expect(component.uploadProgress()).toBe(50);
      expect(component.isUploading()).toBe(true);
    });

    it('handles server errors and renders error alert', () => {
      mockLeaderboardsService.uploadFiles.mockReturnValue(
        throwError(() => ({
          error: { message: 'Database connection failed during batch upsert' },
        })),
      );

      component.files.set([fakeExcelFile]);
      component.startUpload();

      expect(component.isUploading()).toBe(false);
      expect(component.uploadProgress()).toBe(0);
      expect(component.errorMessage()).toBe('Database connection failed during batch upsert');
    });

    it('resets form state when resetForm is called', () => {
      component.importResult.set(mockImportResult);
      component.errorMessage.set('Previous error');

      component.resetForm();

      expect(component.importResult()).toBeNull();
      expect(component.errorMessage()).toBeNull();
      expect(component.files().length).toBe(0);
      expect(component.uploadProgress()).toBe(0);
    });
  });

  describe('Admin Authorization', () => {
    it('disables upload if caller is not an administrator', () => {
      mockAuthService.isAdmin.set(false);
      component.files.set([fakeExcelFile]);

      expect(component.canUpload()).toBe(false);
    });
  });
});
