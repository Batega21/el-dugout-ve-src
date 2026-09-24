import {
  Component,
  input,
  output,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, TranslatePipe],
  host: {
    '[class.full-width]': 'fullWidth()',
  },
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  readonly themeService = inject(ThemeService);

  // 2.1 Tagline text
  readonly tagline = input<string>('HERO.TAGLINE');

  // 2.2 Main heading or Title
  readonly title = input<string>('HERO.TITLE');

  // 2.3 Copy for company context
  readonly description = input<string>('HERO.DESCRIPTION');

  // 2.4 Secondary CTA button placeholder
  readonly secondaryCta = input<string>('HERO.SECONDARY_CTA');

  // 2.5 Primary CTA button placeholder
  readonly primaryCta = input<string>('HERO.PRIMARY_CTA');

  // 2.6 Hero banner images for dark and light themes (covering background)
  readonly darkImage = input<string>('/images/hero_banner-09-2026-dark.jpeg');
  readonly lightImage = input<string>('/images/hero_banner-09-2026-light.jpeg');
  readonly imageAlt = input<string>('HERO.IMAGE_ALT');

  /**
   * Whether to stretch the hero background to full viewport width. Defaults to true.
   */
  readonly fullWidth = input<boolean>(true);

  /**
   * Dynamically resolved hero background image path according to active theme.
   */
  readonly currentImage = computed(() => {
    return this.themeService.isDark() ? this.darkImage() : this.lightImage();
  });

  /**
   * Computed style object for hero section background.
   */
  readonly heroBgStyle = computed(() => ({
    'background-image': `url('${this.currentImage()}')`,
  }));

  readonly primaryAction = output<void>();
  readonly secondaryAction = output<void>();

  onPrimaryClick(): void {
    this.primaryAction.emit();
  }

  onSecondaryClick(): void {
    this.secondaryAction.emit();
  }
}
