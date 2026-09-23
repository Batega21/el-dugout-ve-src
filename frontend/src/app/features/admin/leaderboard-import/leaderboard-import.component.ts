import {
  Component,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { LeaderboardsService } from '../../../core/services/leaderboards.service';
import { AuthService } from '../../../core/services/auth.service';
import { ImportResult } from '../../../core/models/leaderboard.model';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

export interface StagedFileItem {
  file: File;
  name: string;
  formattedSize: string;
  categoryLabel: string;
  categoryCode: string;
}

@Component({
  selector: 'app-leaderboard-import',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    StatusBadgeComponent,
    TranslatePipe,
  ],
  template: `
    <div class="leaderboard-import-container">
      <!-- Header -->
      <header class="import-header">
        <div>
          <nav class="breadcrumb-nav" aria-label="Breadcrumbs">
            <a routerLink="/admin" class="breadcrumb-link">{{ 'LEADERBOARD_IMPORT.BREADCRUMB_DASHBOARD' | translate }}</a>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">{{ 'LEADERBOARD_IMPORT.BREADCRUMB_CURRENT' | translate }}</span>
          </nav>
          <span class="admin-badge">{{ 'ADMIN.FACILITY_BADGE' | translate }}</span>
          <h1>{{ 'LEADERBOARD_IMPORT.TITLE' | translate }}</h1>
          <p class="subtitle">
            {{ 'LEADERBOARD_IMPORT.SUBTITLE' | translate }}
          </p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin" class="btn btn-outline">
            <mat-icon>arrow_back</mat-icon>
            {{ 'LEADERBOARD_IMPORT.BACK_DASHBOARD' | translate }}
          </a>
        </div>
      </header>

      <!-- Security Notice if Non-Admin (Guard fallback) -->
      @if (!authService.isAdmin()) {
        <div class="alert alert-danger" role="alert">
          <mat-icon>gpp_bad</mat-icon>
          <div>
            <strong>{{ 'LEADERBOARD_IMPORT.RESTRICTED_ACCESS' | translate }}</strong>
          </div>
        </div>
      } @else {
        <!-- Error Alerts -->
        @if (errorMessage()) {
          <div class="alert alert-danger" role="alert">
            <mat-icon>error_outline</mat-icon>
            <div class="alert-content">
              <strong>{{ 'LEADERBOARD_IMPORT.IMPORT_ERROR' | translate }}:</strong> {{ errorMessage() }}
            </div>
          </div>
        }

        @if (validationErrors().length > 0) {
          <div class="alert alert-warning" role="alert">
            <mat-icon>warning_amber</mat-icon>
            <div class="alert-content">
              <strong>{{ 'LEADERBOARD_IMPORT.FILE_NOTICE' | translate }}:</strong>
              <ul>
                @for (vErr of validationErrors(); track vErr) {
                  <li>{{ vErr }}</li>
                }
              </ul>
            </div>
          </div>
        }

        <!-- Success Telemetry Card -->
        @if (importResult()) {
          <section class="results-card" aria-label="Import Execution Results">
            <div class="results-header">
              <div class="title-group">
                <mat-icon class="icon-success">check_circle</mat-icon>
                <div>
                  <h2>{{ 'LEADERBOARD_IMPORT.SUCCESS_TITLE' | translate }}</h2>
                  <p class="results-meta">
                    {{ 'LEADERBOARD_IMPORT.SUCCESS_META' | translate:{ processed: importResult()?.processedFiles, total: importResult()?.totalFiles, records: importResult()?.totalRecordsProcessed } }}
                  </p>
                </div>
              </div>
              <button mat-flat-button color="primary" (click)="resetForm()">
                <mat-icon>upload_file</mat-icon>
                {{ 'LEADERBOARD_IMPORT.UPLOAD_MORE' | translate }}
              </button>
            </div>

            <div class="metrics-grid">
              <div class="metric-box">
                <span class="metric-label">{{ 'LEADERBOARD_IMPORT.WORKBOOKS_PROCESSED' | translate }}</span>
                <span class="metric-number">{{ importResult()?.processedFiles }}</span>
                <span class="metric-sub">{{ 'LEADERBOARD_IMPORT.OUT_OF_TOTAL' | translate:{ total: importResult()?.totalFiles } }}</span>
              </div>
              <div class="metric-box highlight">
                <span class="metric-label">{{ 'LEADERBOARD_IMPORT.NEW_RECORDS' | translate }}</span>
                <span class="metric-number text-success">+{{ importResult()?.totalRecordsInserted }}</span>
                <span class="metric-sub">{{ 'LEADERBOARD_IMPORT.STORED_DESC' | translate }}</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">{{ 'LEADERBOARD_IMPORT.RECORDS_UPDATED' | translate }}</span>
                <span class="metric-number text-info">{{ importResult()?.totalRecordsUpdated }}</span>
                <span class="metric-sub">{{ 'LEADERBOARD_IMPORT.REFRESHED_DESC' | translate }}</span>
              </div>
            </div>

            <!-- Per-file breakdown -->
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ 'LEADERBOARD_IMPORT.COL_FILENAME' | translate }}</th>
                    <th>{{ 'LEADERBOARD_IMPORT.COL_CATEGORY' | translate }}</th>
                    <th>{{ 'LEADERBOARD_IMPORT.COL_EXTRACTED' | translate }}</th>
                    <th>{{ 'LEADERBOARD_IMPORT.COL_INSERTED' | translate }}</th>
                    <th>{{ 'LEADERBOARD_IMPORT.COL_UPDATED' | translate }}</th>
                    <th>{{ 'LEADERBOARD_IMPORT.COL_STATUS' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (summary of importResult()?.fileSummaries || []; track summary.fileName) {
                    <tr>
                      <td class="font-medium text-white">{{ summary.fileName }}</td>
                      <td>
                        <span class="category-pill">{{ summary.category }}</span>
                      </td>
                      <td>{{ summary.totalRows }}</td>
                      <td class="text-success font-semibold">+{{ summary.insertedCount }}</td>
                      <td class="text-info">{{ summary.updatedCount }}</td>
                      <td>
                        <app-status-badge
                          [text]="summary.status"
                          [type]="summary.status === 'SUCCESS' ? 'success' : summary.status === 'PARTIAL' ? 'warning' : 'danger'">
                        </app-status-badge>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>
        }

        <!-- Drag and Drop Zone & Upload Queue (Visible when not showing successful result) -->
        @if (!importResult()) {
          <!-- Drag-&-Drop Interactive Dropzone -->
          <div
            class="drop-zone"
            [class.dragging]="isDragging()"
            [class.disabled]="isUploading()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()"
            tabindex="0"
            role="button"
            (keydown.enter)="fileInput.click()"
            (keydown.space)="fileInput.click()"
            [attr.aria-label]="'LEADERBOARD_IMPORT.DRAG_DROP_TITLE' | translate">
            <input
              #fileInput
              type="file"
              multiple
              accept=".xlsx,.xls"
              (change)="onFileSelected($event)"
              hidden />

            <div class="drop-zone-content">
              <div class="drop-icon-wrapper" [class.pulse]="isDragging()">
                <mat-icon class="drop-icon">cloud_upload</mat-icon>
              </div>

              <h3>{{ 'LEADERBOARD_IMPORT.DRAG_DROP_TITLE' | translate }}</h3>
              <p class="drop-hint">
                {{ 'LEADERBOARD_IMPORT.SUPPORTED_FORMATS' | translate }}
                {{ 'LEADERBOARD_IMPORT.TARGET_DATASETS' | translate }}
              </p>

              <button
                type="button"
                class="btn btn-primary"
                [disabled]="isUploading()"
                (click)="$event.stopPropagation(); fileInput.click()">
                <mat-icon>folder_open</mat-icon>
                {{ 'LEADERBOARD_IMPORT.BROWSE_FILES' | translate }}
              </button>
            </div>
          </div>

          <!-- Staged Files Queue -->
          @if (stagedFiles().length > 0) {
            <section class="queue-card" aria-label="Staged Files Queue">
              <div class="queue-header">
                <div>
                  <h2>{{ 'LEADERBOARD_IMPORT.STAGED_TITLE' | translate }} ({{ stagedFiles().length }})</h2>
                  <span class="card-hint">{{ 'LEADERBOARD_IMPORT.STAGED_HINT' | translate }}</span>
                </div>
                <button
                  mat-button
                  color="warn"
                  [disabled]="isUploading()"
                  (click)="clearAllFiles()">
                  <mat-icon>delete_sweep</mat-icon>
                  {{ 'LEADERBOARD_IMPORT.CLEAR_ALL' | translate }}
                </button>
              </div>

              <div class="staged-list">
                @for (item of stagedFiles(); track item.name) {
                  <div class="staged-item">
                    <div class="staged-info">
                      <mat-icon class="excel-icon">description</mat-icon>
                      <div class="staged-text">
                        <span class="file-name">{{ item.name }}</span>
                        <div class="file-meta">
                          <span class="file-size">{{ item.formattedSize }}</span>
                          <span class="category-chip" [class.unknown]="item.categoryCode === 'UNKNOWN'">
                            {{ item.categoryLabel }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      mat-icon-button
                      color="warn"
                      [attr.aria-label]="'LEADERBOARD_IMPORT.REMOVE_FILE' | translate"
                      [disabled]="isUploading()"
                      (click)="removeFile(item.file)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
              </div>

              <!-- Upload Progress Indicator -->
              @if (isUploading()) {
                <div class="progress-section">
                  <div class="progress-meta">
                    <span>{{ 'LEADERBOARD_IMPORT.UPLOADING_PROGRESS' | translate }}</span>
                    <span>{{ uploadProgress() }}%</span>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="uploadProgress()"></mat-progress-bar>
                </div>
              }

              <!-- Action Bar -->
              <div class="queue-actions">
                <button
                  class="btn btn-primary btn-large"
                  [disabled]="!canUpload()"
                  (click)="startUpload()">
                  <mat-icon>play_arrow</mat-icon>
                  {{ (isUploading() ? 'LEADERBOARD_IMPORT.PROCESSING' : 'LEADERBOARD_IMPORT.START_PIPELINE') | translate }}
                </button>
              </div>
            </section>
          }
        }
      }
    </div>
  `,
  styles: [`
    .leaderboard-import-container {
      padding: 2.5rem 0;
      max-width: 1100px;
      margin: 0 auto;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: var(--font-size-xs, 0.8rem);
      margin-bottom: 0.75rem;

      .breadcrumb-link {
        color: var(--ice-blue, #60a5fa);
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
      .breadcrumb-sep {
        color: #6b7280;
      }
      .breadcrumb-current {
        color: var(--text-muted-color, #9ca3af);
      }
    }

    .import-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1.5rem;
      flex-wrap: wrap;

      .admin-badge {
        display: inline-block;
        font-size: var(--font-size-xs, 0.75rem);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--warning, #fbbf24);
        background: rgba(245, 158, 11, 0.15);
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
        margin-bottom: 0.5rem;
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--font-size-2xl, 2rem);
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 0.35rem 0;
      }

      .subtitle {
        color: var(--text-secondary-color, #9ca3af);
        font-size: var(--font-size-sm, 0.95rem);
        max-width: 700px;
        margin: 0;
        line-height: 1.5;
      }
    }

    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 9999px;
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;

      &.btn-primary {
        background: var(--primary-color, #ef4444);
        color: #ffffff;
        box-shadow: 0 2px 10px rgba(239, 68, 68, 0.35);

        &:hover:not(:disabled) {
          background: #dc2626;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.5);
          transform: translateY(-1px);
        }
      }

      &.btn-outline {
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        background: transparent;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      }

      &.btn-large {
        padding: 0.85rem 2rem;
        font-size: 1rem;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    /* Drag & Drop Zone */
    .drop-zone {
      background: var(--background-card-color, #111827);
      border: 2px dashed rgba(255, 255, 255, 0.18);
      border-radius: 1.25rem;
      padding: 3.5rem 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      outline: none;

      &:hover:not(.disabled) {
        border-color: var(--ice-blue, #60a5fa);
        background: rgba(17, 24, 39, 0.85);
        box-shadow: 0 0 20px rgba(96, 165, 250, 0.15);
      }

      &.dragging {
        border-color: #34d399;
        background: rgba(52, 211, 153, 0.08);
        transform: scale(1.01);
        box-shadow: 0 0 25px rgba(52, 211, 153, 0.25);
      }

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .drop-zone-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;

      h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }

      .drop-hint {
        color: #9ca3af;
        font-size: 0.875rem;
        margin: 0;
        max-width: 550px;
        line-height: 1.5;

        code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          color: var(--ice-blue, #60a5fa);
        }
      }
    }

    .drop-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(96, 165, 250, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;

      .drop-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: var(--ice-blue, #60a5fa);
      }

      &.pulse {
        animation: pulse 1s infinite alternate ease-in-out;
      }
    }

    @keyframes pulse {
      from {
        transform: scale(1);
        box-shadow: 0 0 0 rgba(96, 165, 250, 0.2);
      }
      to {
        transform: scale(1.1);
        box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
      }
    }

    /* Queue Card */
    .queue-card, .results-card {
      background: var(--background-card-color, #111827);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      padding: 1.75rem;
      margin-top: 2rem;
    }

    .queue-header, .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;

      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 0.25rem 0;
      }

      .card-hint, .results-meta {
        font-size: 0.8rem;
        color: #9ca3af;
      }
    }

    .staged-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .staged-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 0.75rem;
      transition: background 0.15s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }
    }

    .staged-info {
      display: flex;
      align-items: center;
      gap: 0.85rem;

      .excel-icon {
        color: #34d399;
      }

      .file-name {
        font-weight: 600;
        color: #ffffff;
        font-size: 0.9rem;
      }

      .file-meta {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.2rem;
      }

      .file-size {
        font-size: 0.75rem;
        color: #9ca3af;
      }
    }

    .category-chip, .category-pill {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.15rem 0.55rem;
      border-radius: 9999px;
      background: rgba(96, 165, 250, 0.2);
      color: #93c5fd;

      &.unknown {
        background: rgba(107, 114, 128, 0.2);
        color: #d1d5db;
      }
    }

    .progress-section {
      margin: 1.5rem 0;
      .progress-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: #9ca3af;
        margin-bottom: 0.5rem;
      }
    }

    .queue-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Results Card */
    .title-group {
      display: flex;
      align-items: center;
      gap: 1rem;

      .icon-success {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #34d399;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .metric-box {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 0.75rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;

      .metric-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
        margin-bottom: 0.35rem;
      }

      .metric-number {
        font-size: 1.75rem;
        font-weight: 800;
        color: #ffffff;
      }

      .metric-sub {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.25rem;
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th {
        padding: 0.75rem 1rem;
        text-align: left;
        color: #9ca3af;
        font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        color: #d1d5db;
      }
    }

    .text-success { color: #34d399; }
    .text-info { color: #60a5fa; }
    .text-white { color: #ffffff; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }

    .alert {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;

      ul {
        margin: 0.35rem 0 0 1rem;
        padding: 0;
      }
    }

    .alert-danger {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fde68a;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardImportComponent {
  readonly authService = inject(AuthService);
  private readonly leaderboardsService = inject(LeaderboardsService);

  readonly files = signal<File[]>([]);
  readonly isDragging = signal<boolean>(false);
  readonly isUploading = signal<boolean>(false);
  readonly uploadProgress = signal<number>(0);
  readonly importResult = signal<ImportResult | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly validationErrors = signal<string[]>([]);

  readonly stagedFiles = computed<StagedFileItem[]>(() => {
    return this.files().map((file) => {
      const { label, category } = this.leaderboardsService.detectCategoryPreview(file.name);
      return {
        file,
        name: file.name,
        formattedSize: this.formatBytes(file.size),
        categoryLabel: label,
        categoryCode: category,
      };
    });
  });

  readonly canUpload = computed<boolean>(() => {
    return this.files().length > 0 && !this.isUploading() && this.authService.isAdmin();
  });

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isUploading()) {
      this.isDragging.set(true);
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (this.isUploading()) return;

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      this.handleIncomingFiles(Array.from(droppedFiles));
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleIncomingFiles(Array.from(input.files));
      input.value = ''; // Reset input to allow selecting same file again if removed
    }
  }

  removeFile(fileToRemove: File): void {
    this.files.update((current) => current.filter((f) => f !== fileToRemove));
  }

  clearAllFiles(): void {
    this.files.set([]);
    this.validationErrors.set([]);
    this.errorMessage.set(null);
  }

  resetForm(): void {
    this.files.set([]);
    this.importResult.set(null);
    this.errorMessage.set(null);
    this.validationErrors.set([]);
    this.uploadProgress.set(0);
    this.isUploading.set(false);
  }

  startUpload(): void {
    if (!this.canUpload()) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);
    this.errorMessage.set(null);

    this.leaderboardsService.uploadFiles(this.files()).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round((100 * event.loaded) / event.total);
          this.uploadProgress.set(progress);
        } else if (event instanceof HttpResponse) {
          this.isUploading.set(false);
          this.uploadProgress.set(100);
          this.importResult.set(event.body);
          this.files.set([]);
        }
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadProgress.set(0);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Failed to upload and ingest leaderboard files. Please check network and permissions.';
        this.errorMessage.set(msg);
      },
    });
  }

  private handleIncomingFiles(newFiles: File[]): void {
    const errors: string[] = [];
    const validFiles: File[] = [];
    const currentFiles = this.files();
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    for (const file of newFiles) {
      const isExcel = file.name.match(/\.(xlsx|xls)$/i);
      if (!isExcel) {
        errors.push(`"${file.name}" rejected: Only Excel files (.xlsx, .xls) are supported.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        errors.push(`"${file.name}" rejected: Exceeds 10MB size limit.`);
        continue;
      }

      const alreadyAdded = currentFiles.some((f) => f.name === file.name && f.size === file.size);
      if (alreadyAdded) {
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      this.validationErrors.set(errors);
    } else {
      this.validationErrors.set([]);
    }

    if (validFiles.length > 0) {
      this.files.update((prev) => [...prev, ...validFiles]);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
