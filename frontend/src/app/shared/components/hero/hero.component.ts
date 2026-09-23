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
  template: `
    <section
      class="hero-section"
      [style.background-image]="'url(' + currentImage() + ')'"
      role="banner"
      [attr.aria-label]="title() | translate">
      <!-- Subtle backdrop scrim overlay for text legibility and contrast -->
      <div class="hero-backdrop-overlay" aria-hidden="true"></div>

      <div class="hero-container">
        <!-- Content Column overlaying background (Left aligned) -->
        <div class="hero-content">
          <!-- 2.1 Main Heading or Title -->
          <h1 class="hero-title">{{ title() | translate }}</h1>

          <!-- 2.2 Tagline Text (Pill / Badge) -->
          <div class="tagline-badge">
            <span class="tagline-dot"></span>
            <span class="tagline-text">{{ tagline() | translate }}</span>
          </div>

          <!-- 2.3 Copy for Company Context -->
          <p class="hero-description">{{ description() | translate }}</p>

          <!-- CTA Buttons Group (Dual Pill Buttons matching wireframe) -->
          <div class="hero-actions">
            <!-- 2.4 Secondary CTA Button -->
            <button
              mat-stroked-button
              type="button"
              class="pill-btn secondary-btn"
              (click)="onSecondaryClick()">
              <mat-icon class="btn-icon">phone_in_talk</mat-icon>
              <span>{{ secondaryCta() | translate }}</span>
            </button>

            <!-- 2.5 Primary CTA Button -->
            <button
              mat-flat-button
              type="button"
              class="pill-btn primary-btn"
              (click)="onPrimaryClick()">
              <mat-icon class="btn-icon">mark_email_read</mat-icon>
              <span>{{ primaryCta() | translate }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .hero-section {
      position: relative;
      width: 100%;
      min-height: 640px;
      padding: 5rem 0;
      display: flex;
      align-items: center;
      background-size: cover;
      background-position: right center;
      background-repeat: no-repeat;
      background-color: var(--background-primary-color, #0b0f19);
      overflow: hidden;
      transition: background-image 0.3s ease, background-color var(--transition-normal, 250ms ease);
    }

    .hero-backdrop-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      background: linear-gradient(
        90deg,
        rgba(11, 15, 25, 0.92) 0%,
        rgba(11, 15, 25, 0.6) 42%,
        rgba(11, 15, 25, 0.1) 68%,
        transparent 100%
      );

      @media (max-width: 991px) {
        background: linear-gradient(
          90deg,
          rgba(11, 15, 25, 0.95) 0%,
          rgba(11, 15, 25, 0.82) 50%,
          rgba(11, 15, 25, 0.65) 100%
        );
      }
    }

    :host-context(.light) .hero-backdrop-overlay,
    :host-context([data-theme='light']) .hero-backdrop-overlay {
      background: linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.95) 0%,
        rgba(255, 255, 255, 0.65) 42%,
        rgba(255, 255, 255, 0.15) 68%,
        transparent 100%
      );

      @media (max-width: 991px) {
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.96) 0%,
          rgba(255, 255, 255, 0.88) 50%,
          rgba(255, 255, 255, 0.7) 100%
        );
      }
    }

    .hero-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: var(--wrap-max-width, 1200px);
      margin: 0 auto;
      padding: 0 var(--wrap-padding-x, 1.5rem);
    }

    .hero-content {
      max-width: 580px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    /* 2.1 Main Heading / Title */
    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(4rem, 7vw, var(--font-size-4xl, 5rem));
      font-weight: var(--font-weight-extrabold, 800);
      line-height: var(--line-height-tight, 1.15);
      letter-spacing: -0.03em;
      color: var(--text-color, #ffffff);
      margin: 0 0 1.25rem 0;
    }

    /* 2.2 Tagline Badge */
    .tagline-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.45rem 1rem;
      color: var(--text-secondary-color, #cbd5e1);
      font-family: var(--font-special);
      font-size: var(--font-size-sm, 0.85rem);
      font-weight: var(--font-weight-medium, 500);
      letter-spacing: 0.02em;
      margin-bottom: 1.5rem;
    }

    /* 2.3 Copy for Company Context */
    .hero-description {
      font-family: var(--font-sans);
      font-size: clamp(1rem, 2vw, var(--font-size-lg, 1.15rem));
      line-height: var(--line-height-relaxed, 1.65);
      color: var(--text-secondary-color, #94a3b8);
      max-width: 580px;
      margin: 0 0 2.5rem 0;
    }

    /* Dual Pill CTA Actions */
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }

    .pill-btn {
      border-radius: var(--radius-pill, 9999px) !important;
      height: 3rem !important;
      padding: 0 1.75rem !important;
      font-size: var(--font-size-sm, 0.95rem) !important;
      font-weight: var(--font-weight-semibold, 600) !important;
      text-transform: capitalize;
      letter-spacing: 0.01em;
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      transition: all 0.2s ease !important;

      .btn-icon {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }
    }

    /* 2.4 Secondary CTA Button */
    .secondary-btn {
      color: var(--text-color, #ffffff) !important;
      border-color: var(--border-strong, rgba(255, 255, 255, 0.2)) !important;
      background-color: rgba(255, 255, 255, 0.03) !important;

      &:hover {
        background-color: var(--background-hover-color, rgba(255, 255, 255, 0.08)) !important;
        border-color: var(--text-secondary-color, rgba(255, 255, 255, 0.4)) !important;
        transform: translateY(-1px);
      }
    }

    /* 2.5 Primary CTA Button */
    .primary-btn {
      background-color: var(--primary-color, var(--primary, #ef4444)) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px var(--primary-glow, rgba(239, 68, 68, 0.4));

      &:hover {
        background-color: var(--primary-hover, #dc2626) !important;
        box-shadow: var(--shadow-glow, 0 6px 20px var(--primary-glow, rgba(239, 68, 68, 0.6)));
        transform: translateY(-1px);
      }
    }

    @media (max-width: 640px) {
      .hero-section {
        min-height: 460px;
        padding: 3.5rem 0;
      }

      .hero-actions {
        flex-direction: column;
        width: 100%;

        .pill-btn {
          width: 100%;
          justify-content: center;
        }
      }
    }
  `],
})
export class HeroComponent {
  readonly themeService = inject(ThemeService);

  // 2.1 Tagline text
  readonly tagline = input<string>('Enciclopedia del Béisbol Profesional Venezolano');

  // 2.2 Main heading or Title
  readonly title = input<string>('El Dugout Ve');

  // 2.3 Copy for company context
  readonly description = input<string>(
    'La enciclopedia definitiva del béisbol profesional venezolano (LVBP). Estadísticas históricas, franquicias, rosters, temporadas, boxscores y la historia viva de la pelota criolla.',
  );

  // 2.4 Secondary CTA button placeholder
  readonly secondaryCta = input<string>('Explorar Equipos');

  // 2.5 Primary CTA button placeholder
  readonly primaryCta = input<string>('Suscríbete');

  // 2.6 Hero banner images for dark and light themes (covering background)
  readonly darkImage = input<string>('/images/hero_banner-09-2026-dark.jpeg');
  readonly lightImage = input<string>('/images/hero_banner-09-2026-light.jpeg');
  readonly imageAlt = input<string>('El Dugout Ve - Béisbol Profesional Venezolano');

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
