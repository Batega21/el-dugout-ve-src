import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input() text: string = 'Active';
  @Input() type: 'success' | 'danger' | 'warning' | 'neutral' = 'success';
}
