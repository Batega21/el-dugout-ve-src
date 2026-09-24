import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  /**
   * Temporary animation signal when clicking to toggle.
   */
  readonly isSpinning = signal<boolean>(false);

  toggleTheme(): void {
    this.isSpinning.set(true);
    this.themeService.toggleTheme();

    setTimeout(() => {
      this.isSpinning.set(false);
    }, 450);
  }
}
