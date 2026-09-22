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
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <section class="hero-section">
      <div class="hero-container">
        <!-- Content Column (Left on desktop) -->
        <div class="hero-content">
          <!-- 2.1 Tagline Text (Pill / Badge) -->
          <div class="tagline-badge">
            <span class="tagline-dot"></span>
            <span class="tagline-text">{{ tagline() }}</span>
          </div>

          <!-- 2.2 Main Heading or Title -->
          <h1 class="hero-title">{{ title() }}</h1>

          <!-- 2.3 Copy for Company Context -->
          <p class="hero-description">{{ description() }}</p>

          <!-- CTA Buttons Group (Dual Pill Buttons matching wireframe) -->
          <div class="hero-actions">
            <!-- 2.4 Secondary CTA Button -->
            <button
              mat-stroked-button
              type="button"
              class="pill-btn secondary-btn"
              (click)="onSecondaryClick()">
              <mat-icon class="btn-icon">phone_in_talk</mat-icon>
              <span>{{ secondaryCta() }}</span>
            </button>

            <!-- 2.5 Primary CTA Button -->
            <button
              mat-flat-button
              type="button"
              class="pill-btn primary-btn"
              (click)="onPrimaryClick()">
              <mat-icon class="btn-icon">mark_email_read</mat-icon>
              <span>{{ primaryCta() }}</span>
            </button>
          </div>
        </div>

        <!-- Media Column (Right on desktop) -->
        <div class="hero-media">
          <div class="hero-image-card">
            <img
              [src]="currentImage()"
              [alt]="imageAlt()"
              class="hero-image"
              fetchpriority="high"
              loading="eager"
              decoding="async"
            />
            <div class="hero-image-glare" aria-hidden="true"></div>
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
      padding: 3.5rem 0 3rem 0;
    }

    .hero-container {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr;
      gap: 2.5rem;
      align-items: center;

      @media (min-width: 992px) {
        grid-template-columns: 1.15fr 0.85fr;
        gap: 3rem;
      }
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
    }

    /* 2.1 Tagline Badge */
    .tagline-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.45rem 1rem;
      border-radius: var(--radius-pill, 9999px);
      background-color: var(--background-card-color, rgba(31, 41, 55, 0.7));
      border: 1px solid var(--border-theme-color, rgba(255, 255, 255, 0.1));
      color: var(--text-secondary-color, #cbd5e1);
      font-size: var(--font-size-sm, 0.85rem);
      font-weight: var(--font-weight-medium, 500);
      letter-spacing: 0.02em;
      margin-bottom: 1.5rem;
      backdrop-filter: blur(var(--backdrop-blur, 8px));

      .tagline-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background-color: var(--ice-blue, #38bdf8);
        box-shadow: 0 0 8px var(--ice-blue, #38bdf8);
      }
    }

    /* 2.2 Main Heading / Title */
    .hero-title {
      font-family: var(--font-display);
      font-size: clamp(2.25rem, 5vw, var(--font-size-4xl, 3.5rem));
      font-weight: var(--font-weight-extrabold, 800);
      line-height: var(--line-height-tight, 1.15);
      letter-spacing: -0.03em;
      color: var(--text-color, #ffffff);
      margin: 0 0 1.25rem 0;
      background: var(--hero-title-gradient, linear-gradient(180deg, #ffffff 30%, #94a3b8 100%));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* 2.3 Copy for Company Context */
    .hero-description {
      font-family: var(--font-sans);
      font-size: clamp(1rem, 2vw, var(--font-size-lg, 1.15rem));
      line-height: var(--line-height-relaxed, 1.65);
      color: var(--text-secondary-color, #94a3b8);
      max-width: 680px;
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

    /* 2.6 Hero Media Column & Card */
    .hero-media {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .hero-image-card {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: var(--radius-lg, 16px);
      overflow: hidden;
      background-color: var(--background-secondary-color, #111827);
      border: 1px solid var(--border-theme-color, rgba(255, 255, 255, 0.1));
      box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.4), 0 0 24px var(--primary-glow, rgba(239, 68, 68, 0.15));
      transition: transform var(--transition-normal, 250ms ease),
                  box-shadow var(--transition-normal, 250ms ease),
                  border-color var(--transition-normal, 250ms ease);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 44px -8px rgba(0, 0, 0, 0.5), 0 0 32px var(--primary-glow, rgba(239, 68, 68, 0.25));
        border-color: var(--border-strong, rgba(255, 255, 255, 0.25));
      }
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.3s ease;
    }

    .hero-image-glare {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.08) 0%,
        transparent 50%,
        rgba(0, 0, 0, 0.2) 100%
      );
    }

    @media (max-width: 640px) {
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

  // 2.6 Hero banner images for dark and light themes
  readonly darkImage = input<string>('/images/hero_banner-09-2026-dark.jpeg');
  readonly lightImage = input<string>('/images/hero_banner-09-2026-light.jpeg');
  readonly imageAlt = input<string>('El Dugout Ve - Béisbol Profesional Venezolano');

  /**
   * Dynamically resolved hero image path according to active theme.
   */
  readonly currentImage = computed(() => {
    return this.themeService.isDark() ? this.darkImage() : this.lightImage();
  });

  readonly primaryAction = output<void>();
  readonly secondaryAction = output<void>();

  onPrimaryClick(): void {
    this.primaryAction.emit();
  }

  onSecondaryClick(): void {
    this.secondaryAction.emit();
  }
}
