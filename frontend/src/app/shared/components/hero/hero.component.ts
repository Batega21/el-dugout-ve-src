import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section class="hero-section">
      <div class="hero-container">
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
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .hero-section {
      padding: 4.5rem 0 3.5rem 0;
    }

    .hero-container {
      max-width: 820px;
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
      background: linear-gradient(180deg, #ffffff 30%, #94a3b8 100%);
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
      background-color: var(--primary-color, #3b82f6) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);

      &:hover {
        background-color: var(--primary-hover, #2563eb) !important;
        box-shadow: var(--shadow-glow, 0 6px 20px rgba(59, 130, 246, 0.6));
        transform: translateY(-1px);
      }
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

  readonly primaryAction = output<void>();
  readonly secondaryAction = output<void>();

  onPrimaryClick(): void {
    this.primaryAction.emit();
  }

  onSecondaryClick(): void {
    this.secondaryAction.emit();
  }
}
