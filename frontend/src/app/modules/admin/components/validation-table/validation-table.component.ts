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
  templateUrl: './validation-table.component.html',
  styleUrl: './validation-table.component.scss',
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
