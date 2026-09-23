import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { ImportsService } from '../../../../core/services/imports.service';
import {
  ValidationPreviewDto,
  ValidationPreviewRowDto,
  CommitImportDto,
} from '../../../../core/models/import.model';
import { ValidationTableComponent } from '../validation-table/validation-table.component';

@Component({
  selector: 'app-import-file',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ValidationTableComponent,
    TranslatePipe,
  ],
  template: `
    <div class="import-page-container">
      <!-- Breadcrumb Navigation -->
      <nav class="breadcrumb-nav" aria-label="Breadcrumbs">
        <a routerLink="/admin" class="breadcrumb-link">{{ 'IMPORT_EXCEL.HEADER.BREADCRUMB_DASHBOARD' | translate }}</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ 'IMPORT_EXCEL.HEADER.BREADCRUMB_CURRENT' | translate }}</span>
      </nav>

      <!-- Page Header -->
      <header class="page-header">
        <div>
          <span class="admin-badge">{{ 'IMPORT_EXCEL.HEADER.BADGE' | translate }}</span>
          <h1 class="page-title">{{ 'IMPORT_EXCEL.HEADER.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'IMPORT_EXCEL.HEADER.SUBTITLE' | translate }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin" class="btn btn-outline">
            <mat-icon>arrow_back</mat-icon>
            {{ 'IMPORT_EXCEL.ACTIONS.BACK_DASHBOARD' | translate }}
          </a>
        </div>
      </header>

      <!-- Non-Admin Security Notice -->
      @if (!authService.isAdmin()) {
        <div class="alert alert-danger" role="alert">
          <mat-icon class="alert-icon">gpp_bad</mat-icon>
          <div>
            <strong>{{ 'IMPORT_EXCEL.ALERTS.ACCESS_DENIED' | translate }}:</strong>
            <span>{{ 'IMPORT_EXCEL.ALERTS.ADMIN_REQUIRED' | translate }}</span>
          </div>
        </div>
      } @else {
        <!-- Global Error Alert -->
        @if (errorMessage()) {
          <div class="alert alert-danger" role="alert">
            <mat-icon class="alert-icon">error_outline</mat-icon>
            <div class="alert-content">
              <strong>{{ 'IMPORT_EXCEL.ALERTS.ERROR_TITLE' | translate }}:</strong>
              <span>{{ errorMessage() }}</span>
            </div>
            <button
              type="button"
              class="close-btn"
              (click)="clearError()"
              [attr.aria-label]="'IMPORT_EXCEL.ACTIONS.DISMISS' | translate">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        }

        <!-- Success Alert -->
        @if (successMessage()) {
          <div class="alert alert-success" role="alert">
            <mat-icon class="alert-icon">check_circle</mat-icon>
            <div class="alert-content">
              <strong>{{ 'IMPORT_EXCEL.ALERTS.SUCCESS_TITLE' | translate }}:</strong>
              <span>{{ successMessage() }}</span>
            </div>
            <button
              type="button"
              class="close-btn"
              (click)="clearSuccess()"
              [attr.aria-label]="'IMPORT_EXCEL.ACTIONS.DISMISS' | translate">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        }

        <!-- Active View 1: Dropzone & File Selection (Visible when not in preview mode) -->
        @if (!previewData()) {
          <section class="upload-section">
            <!-- Drag & Drop Dropzone -->
            <div
              class="dropzone-card"
              [class.dragging]="isDragging()"
              [class.has-file]="file() !== null"
              [class.loading]="isValidating() || isUploading()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="triggerFilePicker(fileInput)"
              tabindex="0"
              role="button"
              (keydown.enter)="triggerFilePicker(fileInput)"
              (keydown.space)="triggerFilePicker(fileInput)"
              [attr.aria-label]="'IMPORT_EXCEL.DROPZONE.TITLE' | translate">

              <input
                #fileInput
                type="file"
                accept=".xlsx,.xls"
                (change)="onFileSelected($event)"
                hidden />

              <div class="dropzone-content">
                @if (isValidating()) {
                  <div class="spinner-container">
                    <mat-progress-spinner mode="indeterminate" diameter="48"></mat-progress-spinner>
                    <p class="loading-label">{{ 'IMPORT_EXCEL.DROPZONE.VALIDATING_MSG' | translate }}</p>
                  </div>
                } @else {
                  <div class="upload-icon-wrapper" [class.pulse]="isDragging()">
                    <mat-icon class="upload-icon">cloud_upload</mat-icon>
                  </div>

                  <h2 class="drop-title">{{ 'IMPORT_EXCEL.DROPZONE.TITLE' | translate }}</h2>
                  <p class="drop-desc">
                    {{ 'IMPORT_EXCEL.DROPZONE.SUBTITLE' | translate }}
                  </p>

                  <div class="security-badges">
                    <span class="sec-chip">
                      <mat-icon class="chip-icon">verified_user</mat-icon>
                      {{ 'IMPORT_EXCEL.DROPZONE.CHIP_SIGNATURE' | translate }}
                    </span>
                    <span class="sec-chip">
                      <mat-icon class="chip-icon">lock</mat-icon>
                      {{ 'IMPORT_EXCEL.DROPZONE.CHIP_SIZE' | translate }}
                    </span>
                    <span class="sec-chip">
                      <mat-icon class="chip-icon">security</mat-icon>
                      {{ 'IMPORT_EXCEL.DROPZONE.CHIP_FORMULA' | translate }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="btn btn-browse"
                    [disabled]="isValidating() || isUploading()"
                    (click)="$event.stopPropagation(); fileInput.click()">
                    <mat-icon>folder_open</mat-icon>
                    {{ 'IMPORT_EXCEL.DROPZONE.BROWSE_BTN' | translate }}
                  </button>
                }
              </div>
            </div>

            <!-- Selected File Details Card -->
            @if (file(); as selectedFile) {
              <div class="staged-file-card">
                <div class="staged-info">
                  <div class="excel-badge-icon">
                    <mat-icon>description</mat-icon>
                  </div>
                  <div class="file-text-group">
                    <span class="file-title-text">{{ selectedFile.name }}</span>
                    <div class="file-meta-row">
                      <span class="file-size-tag">{{ formatBytes(selectedFile.size) }}</span>
                      <span class="verified-tag">
                        <mat-icon class="verified-icon">verified</mat-icon>
                        {{ 'IMPORT_EXCEL.DROPZONE.BINARY_OK' | translate }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="staged-actions">
                  <button
                    type="button"
                    class="btn btn-danger-ghost"
                    [disabled]="isValidating() || isUploading()"
                    (click)="removeSelectedFile()">
                    <mat-icon>delete_outline</mat-icon>
                    {{ 'IMPORT_EXCEL.ACTIONS.REMOVE_FILE' | translate }}
                  </button>

                  <button
                    type="button"
                    class="btn btn-primary"
                    [disabled]="!canValidate()"
                    (click)="validateFileOnServer()">
                    @if (isValidating()) {
                      <mat-progress-spinner mode="indeterminate" diameter="20"></mat-progress-spinner>
                      <span>{{ 'IMPORT_EXCEL.ACTIONS.VALIDATING' | translate }}</span>
                    } @else {
                      <mat-icon>rule</mat-icon>
                      <span>{{ 'IMPORT_EXCEL.ACTIONS.VALIDATE_BTN' | translate }}</span>
                    }
                  </button>
                </div>
              </div>
            }
          </section>
        }

        <!-- Active View 2: Validation Table Component (Renders once preview data arrives) -->
        @if (previewData(); as preview) {
          <app-validation-table
            [preview]="preview"
            [isCommitting]="isUploading()"
            (commit)="onCommitRecords($event)"
            (discard)="onDiscardPreview()">
          </app-validation-table>
        }
      }
    </div>
  `,
  styles: [`
    .import-page-container {
      padding: 2.5rem 0;
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* Breadcrumbs */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #9ca3af;
    }

    .breadcrumb-link {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.15s ease;

      &:hover {
        color: #e52323;
      }
    }

    .breadcrumb-sep {
      color: #4b5563;
    }

    .breadcrumb-current {
      color: #f3f4f6;
      font-weight: 500;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #1f2937;
    }

    .admin-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #e52323;
      margin-bottom: 0.4rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.4rem 0;
      letter-spacing: -0.02em;
    }

    .page-subtitle {
      color: #9ca3af;
      margin: 0;
      font-size: 0.95rem;
      max-width: 650px;
      line-height: 1.5;
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
      position: relative;

      .alert-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .alert-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .close-btn {
        background: transparent;
        border: none;
        color: inherit;
        cursor: pointer;
        opacity: 0.7;
        padding: 0.25rem;
        display: flex;
        align-items: center;

        &:hover {
          opacity: 1;
        }
      }
    }

    .alert-danger {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
    }

    /* Upload Dropzone */
    .dropzone-card {
      border: 2px dashed #374151;
      border-radius: 1rem;
      background: #111827;
      padding: 3.5rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;

      &:hover, &:focus-visible {
        border-color: #e52323;
        background: rgba(229, 35, 35, 0.03);
      }

      &.dragging {
        border-color: #e52323;
        background: rgba(229, 35, 35, 0.08);
        transform: scale(1.005);
      }

      &.has-file {
        border-color: #10b981;
      }

      &.loading {
        cursor: wait;
        opacity: 0.85;
      }
    }

    .dropzone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      max-width: 580px;
      margin: 0 auto;
    }

    .upload-icon-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(229, 35, 35, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e52323;
      transition: transform 0.2s ease;

      .upload-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      &.pulse {
        transform: scale(1.1);
        background: rgba(229, 35, 35, 0.25);
      }
    }

    .drop-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .drop-desc {
      font-size: 0.9rem;
      color: #9ca3af;
      margin: 0;
      line-height: 1.5;
    }

    .security-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin: 0.5rem 0;
    }

    .sec-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: #9ca3af;
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 9999px;
      padding: 0.25rem 0.65rem;

      .chip-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: #e52323;
      }
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      padding: 2rem 0;

      .loading-label {
        color: #d1d5db;
        font-size: 0.95rem;
        font-weight: 500;
        margin: 0;
      }
    }

    /* Staged File Card */
    .staged-file-card {
      margin-top: 1.25rem;
      padding: 1.25rem 1.5rem;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      animation: fadeIn 0.2s ease;
    }

    .staged-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      .excel-badge-icon {
        width: 44px;
        height: 44px;
        background: rgba(16, 185, 129, 0.12);
        color: #10b981;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .file-text-group {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .file-title-text {
        font-weight: 600;
        color: #ffffff;
        font-size: 1rem;
      }

      .file-meta-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.8rem;
      }

      .file-size-tag {
        color: #9ca3af;
      }

      .verified-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        color: #34d399;
        font-weight: 600;

        .verified-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
    }

    .staged-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.25rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      text-decoration: none;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-outline {
      background: transparent;
      border-color: #374151;
      color: #d1d5db;

      &:hover {
        background: #1f2937;
        color: #ffffff;
      }
    }

    .btn-browse {
      background: #1f2937;
      border-color: #374151;
      color: #ffffff;

      &:hover:not(:disabled) {
        background: #374151;
        border-color: #4b5563;
      }
    }

    .btn-primary {
      background: #e52323;
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(229, 35, 35, 0.35);

      &:hover:not(:disabled) {
        background: #dc2626;
        box-shadow: 0 4px 14px rgba(229, 35, 35, 0.5);
      }
    }

    .btn-danger-ghost {
      background: transparent;
      border-color: transparent;
      color: #f87171;

      &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.1);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportFileComponent {
  readonly authService = inject(AuthService);
  private readonly importsService = inject(ImportsService);

  readonly file = signal<File | null>(null);
  readonly isValidating = signal<boolean>(false);
  readonly isUploading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly previewData = signal<ValidationPreviewDto | null>(null);
  readonly isDragging = signal<boolean>(false);

  readonly canValidate = computed<boolean>(() => {
    return this.file() !== null && !this.isValidating() && !this.isUploading() && this.authService.isAdmin();
  });

  triggerFilePicker(input: HTMLInputElement): void {
    if (!this.isValidating() && !this.isUploading()) {
      input.click();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isValidating() && !this.isUploading()) {
      this.isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.isValidating() || this.isUploading()) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.processIncomingFile(files[0]);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await this.processIncomingFile(input.files[0]);
      input.value = ''; // Reset input so same file can be re-selected if removed
    }
  }

  /**
   * Client-side validation for extension, size, and magic numbers.
   */
  async processIncomingFile(file: File): Promise<void> {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // 1. Extension & MIME-type Check
    const isExtensionExcel = file.name.match(/\.(xlsx|xls)$/i);
    const validMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '',
    ];
    if (!isExtensionExcel || (file.type && !validMimes.includes(file.type))) {
      this.errorMessage.set(
        `"${file.name}": Formato de archivo rechazado. Solo se permiten hojas de cálculo en formato Excel (.xlsx, .xls).`,
      );
      this.file.set(null);
      return;
    }

    // 2. File Size Constraint (Max 8 MB)
    const MAX_SIZE_BYTES = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      this.errorMessage.set(
        `"${file.name}": El archivo excede el límite máximo de 8 MB (${this.formatBytes(file.size)}).`,
      );
      this.file.set(null);
      return;
    }

    // 3. Magic Number (Binary Signature) Check
    const hasValidSignature = await this.importsService.verifyFileMagicNumber(file);
    if (!hasValidSignature) {
      this.errorMessage.set(
        `"${file.name}": Firma binaria inválida. El archivo no corresponde a un documento Excel auténtico o contiene datos ejecutables. Transmisión bloqueada.`,
      );
      this.file.set(null);
      return;
    }

    this.file.set(file);
  }

  removeSelectedFile(): void {
    this.file.set(null);
    this.errorMessage.set(null);
  }

  clearError(): void {
    this.errorMessage.set(null);
  }

  clearSuccess(): void {
    this.successMessage.set(null);
  }

  /**
   * Calls preview endpoint to validate structure and check DB duplicate records.
   */
  validateFileOnServer(): void {
    const currentFile = this.file();
    if (!currentFile || !this.canValidate()) return;

    this.isValidating.set(true);
    this.errorMessage.set(null);

    this.importsService.previewFile(currentFile).subscribe({
      next: (previewResult) => {
        this.isValidating.set(false);
        this.previewData.set(previewResult);
      },
      error: (err) => {
        this.isValidating.set(false);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Error al validar el archivo en el servidor. Verifica las columnas requeridas y tu conexión.';
        this.errorMessage.set(msg);
      },
    });
  }

  /**
   * Commit validated records to database.
   */
  onCommitRecords(rowsToCommit: ValidationPreviewRowDto[]): void {
    const preview = this.previewData();
    if (!preview || rowsToCommit.length === 0) return;

    this.isUploading.set(true);
    this.errorMessage.set(null);

    const payload: CommitImportDto = {
      category: preview.category,
      rows: rowsToCommit.map((r) => ({
        seasonCode: r.seasonCode,
        startYear: r.startYear,
        endYear: r.endYear,
        playerName: r.playerName,
        playerSlug: r.playerSlug,
        teamRaw: r.teamRaw,
        category: r.category,
        statValue: r.statValue,
        extraAttributes: r.extraAttributes,
      })),
    };

    this.importsService.commitImport(payload).subscribe({
      next: (result) => {
        this.isUploading.set(false);
        this.previewData.set(null);
        this.file.set(null);
        this.successMessage.set(
          result.message ||
            `¡Importación exitosa! Se han guardado ${result.totalProcessed} registros en la base de datos (${result.insertedCount} nuevos, ${result.updatedCount} actualizados).`,
        );
      },
      error: (err) => {
        this.isUploading.set(false);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Error durante la confirmación en la base de datos. Se revirtió la transacción.';
        this.errorMessage.set(msg);
      },
    });
  }

  onDiscardPreview(): void {
    this.previewData.set(null);
    this.errorMessage.set(null);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
