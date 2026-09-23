import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ValidationPreviewDto,
  ValidationPreviewRowDto,
} from '../../../../core/models/import.model';

export const DEFAULT_VALIDATION_PREVIEW: ValidationPreviewDto = {
  fileName: '',
  category: 'BATTING_AVERAGE',
  summary: {
    total: 0,
    valid: 0,
    duplicates: 0,
    errors: 0,
  },
  rows: [],
};

@Component({
  selector: 'app-validation-table',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  template: `
    <div class="validation-container">
      <!-- Top Overview Bar -->
      <div class="overview-header">
        <div class="file-meta">
          <div class="meta-icon">
            <mat-icon>table_chart</mat-icon>
          </div>
          <div>
            <h2 class="file-title">{{ preview().fileName }}</h2>
            <div class="meta-sub">
              <span class="category-badge">{{ preview().category }}</span>
              <span class="dot-sep">•</span>
              <span>{{ 'IMPORT_EXCEL.TABLE.TITLE' | translate }}</span>
            </div>
          </div>
        </div>

        <div class="quick-filter-group" role="group" [attr.aria-label]="'IMPORT_EXCEL.TABLE.FILTER_LABEL' | translate">
          <button
            type="button"
            class="filter-pill"
            [class.active]="activeFilter() === 'ALL'"
            (click)="setFilter('ALL')">
            {{ 'IMPORT_EXCEL.TABLE.FILTER_ALL' | translate }} ({{ preview().summary.total }})
          </button>
          <button
            type="button"
            class="filter-pill pill-success"
            [class.active]="activeFilter() === 'VALID'"
            (click)="setFilter('VALID')">
            {{ 'IMPORT_EXCEL.TABLE.FILTER_VALID' | translate }} ({{ preview().summary.valid }})
          </button>
          <button
            type="button"
            class="filter-pill pill-warning"
            [class.active]="activeFilter() === 'DUPLICATE'"
            (click)="setFilter('DUPLICATE')">
            {{ 'IMPORT_EXCEL.TABLE.FILTER_DUPLICATE' | translate }} ({{ preview().summary.duplicates }})
          </button>
          @if (preview().summary.errors > 0) {
            <button
              type="button"
              class="filter-pill pill-danger"
              [class.active]="activeFilter() === 'ERROR'"
              (click)="setFilter('ERROR')">
              {{ 'IMPORT_EXCEL.TABLE.FILTER_ERROR' | translate }} ({{ preview().summary.errors }})
            </button>
          }
        </div>
      </div>

      <!-- Telemetry Summary Cards -->
      <section class="summary-grid" [attr.aria-label]="'IMPORT_EXCEL.SUMMARY.SECTION_TITLE' | translate">
        <!-- Total Rows -->
        <div class="summary-card card-neutral">
          <div class="card-icon">
            <mat-icon>format_list_numbered</mat-icon>
          </div>
          <div class="card-details">
            <span class="card-label">{{ 'IMPORT_EXCEL.SUMMARY.TOTAL_ROWS' | translate }}</span>
            <span class="card-value">{{ preview().summary.total }}</span>
            <span class="card-sub">{{ 'IMPORT_EXCEL.SUMMARY.DETECTED_ROWS' | translate }}</span>
          </div>
        </div>

        <!-- Valid Rows (Green) -->
        <div class="summary-card card-success">
          <div class="card-icon">
            <mat-icon>check_circle</mat-icon>
          </div>
          <div class="card-details">
            <span class="card-label">{{ 'IMPORT_EXCEL.SUMMARY.VALID_ROWS' | translate }}</span>
            <span class="card-value text-success">+{{ preview().summary.valid }}</span>
            <span class="card-sub">{{ 'IMPORT_EXCEL.SUMMARY.READY_TO_COMMIT' | translate }}</span>
          </div>
        </div>

        <!-- Duplicate Rows (Orange/Amber) -->
        <div class="summary-card card-warning">
          <div class="card-icon">
            <mat-icon>content_copy</mat-icon>
          </div>
          <div class="card-details">
            <span class="card-label">{{ 'IMPORT_EXCEL.SUMMARY.DUPLICATE_ROWS' | translate }}</span>
            <span class="card-value text-warning">{{ preview().summary.duplicates }}</span>
            <span class="card-sub">{{ 'IMPORT_EXCEL.SUMMARY.DB_CONFLICT' | translate }}</span>
          </div>
        </div>

        <!-- Errors / Malformed (Red) -->
        <div class="summary-card card-danger">
          <div class="card-icon">
            <mat-icon>error_outline</mat-icon>
          </div>
          <div class="card-details">
            <span class="card-label">{{ 'IMPORT_EXCEL.SUMMARY.ERROR_ROWS' | translate }}</span>
            <span class="card-value text-danger">{{ preview().summary.errors }}</span>
            <span class="card-sub">{{ 'IMPORT_EXCEL.SUMMARY.MALFORMED_ROWS' | translate }}</span>
          </div>
        </div>
      </section>

      <!-- Data Table -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table" [attr.aria-label]="'IMPORT_EXCEL.TABLE.TITLE' | translate">
            <thead>
              <tr>
                <th class="col-num">{{ 'IMPORT_EXCEL.TABLE.COL_NUM' | translate }}</th>
                <th>{{ 'IMPORT_EXCEL.TABLE.COL_PLAYER' | translate }}</th>
                <th>{{ 'IMPORT_EXCEL.TABLE.COL_TEAM' | translate }}</th>
                <th>{{ 'IMPORT_EXCEL.TABLE.COL_SEASON' | translate }}</th>
                <th class="text-right">{{ 'IMPORT_EXCEL.TABLE.COL_METRIC' | translate }}</th>
                <th>{{ 'IMPORT_EXCEL.TABLE.COL_STATUS' | translate }}</th>
                <th>{{ 'IMPORT_EXCEL.TABLE.COL_NOTES' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of filteredRows(); track row.rowNumber + '_' + row.playerSlug) {
                <tr
                  class="data-row"
                  [class.row-duplicate]="row.status === 'DUPLICATE'"
                  [class.row-error]="row.status === 'ERROR'"
                  [class.row-valid]="row.status === 'VALID'">
                  <td class="col-num">#{{ row.rowNumber }}</td>
                  <td class="font-medium text-white">
                    {{ row.playerName }}
                    <span class="player-slug">({{ row.playerSlug }})</span>
                  </td>
                  <td>
                    <span class="team-label">{{ row.teamRaw }}</span>
                    @if (row.canonicalTeam) {
                      <span class="canonical-badge">{{ row.canonicalTeam }}</span>
                    }
                  </td>
                  <td>
                    <span class="season-badge">{{ row.seasonCode }}</span>
                  </td>
                  <td class="text-right font-mono font-semibold metric-cell">
                    {{ formatMetric(row.statValue) }}
                  </td>
                  <td>
                    @switch (row.status) {
                      @case ('VALID') {
                        <span class="badge-status badge-valid">
                          <mat-icon class="badge-icon">check</mat-icon>
                          {{ 'IMPORT_EXCEL.STATUS.VALID' | translate }}
                        </span>
                      }
                      @case ('DUPLICATE') {
                        <span class="badge-status badge-duplicate">
                          <mat-icon class="badge-icon">warning</mat-icon>
                          {{ 'IMPORT_EXCEL.STATUS.DUPLICATE' | translate }}
                        </span>
                      }
                      @case ('ERROR') {
                        <span class="badge-status badge-error">
                          <mat-icon class="badge-icon">block</mat-icon>
                          {{ 'IMPORT_EXCEL.STATUS.ERROR' | translate }}
                        </span>
                      }
                    }
                  </td>
                  <td class="notes-cell">
                    <span class="note-text" [title]="row.validationMessage || ''">
                      {{ row.validationMessage || ('IMPORT_EXCEL.STATUS.READY' | translate) }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-cell">
                    {{ 'IMPORT_EXCEL.TABLE.EMPTY_FILTER' | translate }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Footer -->
      <footer class="action-footer">
        <button
          type="button"
          class="btn btn-ghost"
          [disabled]="isCommitting()"
          (click)="onDiscard()">
          <mat-icon>arrow_back</mat-icon>
          {{ 'IMPORT_EXCEL.ACTIONS.DISCARD' | translate }}
        </button>

        <div class="commit-group">
          @if (isCommitting()) {
            <div class="commit-loading">
              <mat-progress-spinner mode="indeterminate" diameter="24"></mat-progress-spinner>
              <span>{{ 'IMPORT_EXCEL.ACTIONS.SAVING' | translate }}</span>
            </div>
          }

          <button
            type="button"
            class="btn btn-commit-primary"
            [disabled]="isCommitting() || validRows().length === 0"
            (click)="onCommit()">
            <mat-icon>cloud_upload</mat-icon>
            {{ 'IMPORT_EXCEL.ACTIONS.CONFIRM_SAVE' | translate }} ({{ validRows().length }})
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .validation-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Overview Header */
    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 0.75rem;
    }

    .file-meta {
      display: flex;
      align-items: center;
      gap: 1rem;

      .meta-icon {
        width: 44px;
        height: 44px;
        border-radius: 0.5rem;
        background: rgba(229, 35, 35, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #e52323;
      }

      .file-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: #ffffff;
      }

      .meta-sub {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.825rem;
        color: #9ca3af;
        margin-top: 0.2rem;
      }

      .dot-sep {
        color: #4b5563;
      }

      .category-badge {
        display: inline-block;
        font-size: 0.725rem;
        font-weight: 600;
        padding: 0.15rem 0.5rem;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 9999px;
        color: #e5e7eb;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    }

    /* Quick Filter Pills */
    .quick-filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .filter-pill {
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      border: 1px solid #374151;
      background: #1f2937;
      color: #9ca3af;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: #374151;
        color: #ffffff;
      }

      &.active {
        background: #e52323;
        border-color: #e52323;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(229, 35, 35, 0.35);
      }

      &.pill-success.active {
        background: #10b981;
        border-color: #10b981;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
      }

      &.pill-warning.active {
        background: #f59e0b;
        border-color: #f59e0b;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
      }

      &.pill-danger.active {
        background: #ef4444;
        border-color: #ef4444;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);
      }
    }

    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 1rem;
    }

    .summary-card {
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: #111827;
      border: 1px solid #1f2937;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: border-color 0.15s ease;

      .card-icon {
        width: 38px;
        height: 38px;
        border-radius: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .card-details {
        display: flex;
        flex-direction: column;
      }

      .card-label {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
      }

      .card-value {
        font-size: 1.65rem;
        font-weight: 800;
        line-height: 1.2;
        margin: 0.25rem 0;
        color: #ffffff;
      }

      .card-sub {
        font-size: 0.75rem;
        color: #6b7280;
      }
    }

    .card-neutral .card-icon {
      background: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
    }

    .card-success {
      border-color: rgba(16, 185, 129, 0.3);
      .card-icon {
        background: rgba(16, 185, 129, 0.12);
        color: #34d399;
      }
    }

    .card-warning {
      border-color: rgba(245, 158, 11, 0.3);
      .card-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #fbbf24;
      }
    }

    .card-danger {
      border-color: rgba(239, 68, 68, 0.3);
      .card-icon {
        background: rgba(239, 68, 68, 0.12);
        color: #f87171;
      }
    }

    .text-success { color: #34d399 !important; }
    .text-warning { color: #fbbf24 !important; }
    .text-danger { color: #f87171 !important; }

    /* Table Container */
    .table-card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 0.75rem;
      overflow: hidden;
    }

    .table-responsive {
      max-height: 480px;
      overflow-y: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      thead {
        position: sticky;
        top: 0;
        background: #0f172a;
        z-index: 10;
      }

      th {
        padding: 0.85rem 1rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #9ca3af;
        border-bottom: 1px solid #1f2937;
      }

      td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        color: #d1d5db;
        vertical-align: middle;
      }
    }

    .col-num {
      width: 65px;
      color: #6b7280 !important;
      font-family: monospace;
    }

    .text-right {
      text-align: right;
    }

    .data-row {
      transition: background-color 0.1s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.03);
      }

      &.row-duplicate {
        background: rgba(245, 158, 11, 0.06);
        border-left: 3px solid #f59e0b;
      }

      &.row-error {
        background: rgba(239, 68, 68, 0.08);
        border-left: 3px solid #ef4444;
      }

      &.row-valid {
        border-left: 3px solid transparent;
      }
    }

    .player-slug {
      display: block;
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 400;
    }

    .team-label {
      font-weight: 500;
      color: #e5e7eb;
    }

    .canonical-badge {
      display: inline-block;
      margin-left: 0.35rem;
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      background: rgba(59, 130, 246, 0.12);
      color: #93c5fd;
      border-radius: 4px;
    }

    .season-badge {
      font-family: monospace;
      font-weight: 600;
      color: #cbd5e1;
      padding: 0.2rem 0.45rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .metric-cell {
      color: #f3f4f6;
      font-size: 0.95rem;
    }

    /* Badges */
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.725rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;

      .badge-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .badge-valid {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }

    .badge-duplicate {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }

    .badge-error {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
    }

    .notes-cell {
      max-width: 280px;
    }

    .note-text {
      display: block;
      font-size: 0.8rem;
      color: #9ca3af;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty-cell {
      text-align: center;
      padding: 2.5rem;
      color: #6b7280;
      font-style: italic;
    }

    /* Action Footer */
    .action-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 0.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .commit-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .commit-loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #9ca3af;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-ghost {
      background: transparent;
      border-color: #374151;
      color: #d1d5db;

      &:hover:not(:disabled) {
        background: #1f2937;
        color: #ffffff;
      }
    }

    .btn-commit-primary {
      background: #e52323;
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(229, 35, 35, 0.4);

      &:hover:not(:disabled) {
        background: #dc2626;
        box-shadow: 0 4px 14px rgba(229, 35, 35, 0.55);
        transform: translateY(-1px);
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationTableComponent {
  readonly preview = input<ValidationPreviewDto>(DEFAULT_VALIDATION_PREVIEW);
  readonly isCommitting = input<boolean>(false);

  readonly commit = output<ValidationPreviewRowDto[]>();
  readonly discard = output<void>();

  readonly activeFilter = signal<'ALL' | 'VALID' | 'DUPLICATE' | 'ERROR'>('ALL');

  readonly validRows = computed(() =>
    this.preview().rows.filter((r) => r.status === 'VALID'),
  );

  readonly filteredRows = computed(() => {
    const f = this.activeFilter();
    const rows = this.preview().rows;
    if (f === 'ALL') return rows;
    return rows.filter((r) => r.status === f);
  });

  setFilter(filter: 'ALL' | 'VALID' | 'DUPLICATE' | 'ERROR'): void {
    this.activeFilter.set(filter);
  }

  formatMetric(val: number): string {
    if (typeof val !== 'number' || isNaN(val)) return '-';
    // Format batting average nicely (e.g. .403)
    if (val > 0 && val < 1) {
      return val.toFixed(3).replace(/^0\./, '.');
    }
    return val.toString();
  }

  onCommit(): void {
    const rowsToCommit = this.validRows();
    if (rowsToCommit.length > 0 && !this.isCommitting()) {
      this.commit.emit(rowsToCommit);
    }
  }

  onDiscard(): void {
    if (!this.isCommitting()) {
      this.discard.emit();
    }
  }
}
