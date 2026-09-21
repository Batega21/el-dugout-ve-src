import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="type">
      <span class="dot"></span>
      <span class="text">{{ text }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-pill, 9999px);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-medium, 500);
      border: 1px solid transparent;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.success {
        background-color: rgba(16, 185, 129, 0.15);
        color: var(--success, #34d399);
        border-color: rgba(16, 185, 129, 0.3);
        .dot { background-color: var(--success, #10b981); }
      }

      &.danger {
        background-color: rgba(239, 68, 68, 0.15);
        color: var(--danger, #f87171);
        border-color: rgba(239, 68, 68, 0.3);
        .dot { background-color: var(--danger, #ef4444); }
      }

      &.warning {
        background-color: rgba(245, 158, 11, 0.15);
        color: var(--warning, #fbbf24);
        border-color: rgba(245, 158, 11, 0.3);
        .dot { background-color: var(--warning, #f59e0b); }
      }

      &.neutral {
        background-color: rgba(156, 163, 175, 0.15);
        color: var(--text-secondary-color, #9ca3af);
        border-color: rgba(156, 163, 175, 0.3);
        .dot { background-color: var(--text-secondary-color, #9ca3af); }
      }
    }
  `],
})
export class StatusBadgeComponent {
  @Input() text: string = 'Active';
  @Input() type: 'success' | 'danger' | 'warning' | 'neutral' = 'success';
}
