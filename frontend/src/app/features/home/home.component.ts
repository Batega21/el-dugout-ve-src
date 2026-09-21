import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { SectionComponent } from '../../shared/components/section/section.component';
import { SectionCardsComponent } from '../../shared/components/section-cards/section-cards.component';
import { SectionConfig } from '../../shared/components/section/section.interface';
import { SectionCardsConfig, DEFAULT_SECTION_CARDS_CONFIG } from '../../shared/components/section-cards/section-cards.interface';
import { SubscriptionDialogComponent } from '../../shared/components/subscription-dialog/subscription-dialog.component';
import { SignUpDialogComponent } from '../../shared/components/sign-up-dialog/sign-up-dialog.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, SectionComponent, SectionCardsComponent],
  template: `
    <div class="home-page">
      <!-- Hero Component matching wireframe reference -->
      <app-hero
        (primaryAction)="onSubscribe()"
        (secondaryAction)="onCall()">
      </app-hero>

      <!-- Section Components (Config-Driven 60/40 Split, Alignment & Layered Media) -->
      <app-section [config]="section1Config"></app-section>

      <app-section [config]="section2Config"></app-section>

      <!-- System Health Matrix (Config-Driven, Visible for Logged Admin Users) -->
      <app-section-cards [config]="systemHealthCardsConfig"></app-section-cards>

      <!-- Quick Setup Guide -->
      <section class="guide-section">
        <h2>Developer Quickstart</h2>
        <div class="steps-grid">
          <div class="card step-card">
            <span class="step-number">01</span>
            <h4>Start Database</h4>
            <p>Launch PostgreSQL 16 container with local persistence and Adminer GUI.</p>
            <pre><code>npm run docker:db</code></pre>
          </div>
          <div class="card step-card">
            <span class="step-number">02</span>
            <h4>Start Backend</h4>
            <p>Run NestJS in watch mode with automatic schema migration.</p>
            <pre><code>npm run dev:backend</code></pre>
          </div>
          <div class="card step-card">
            <span class="step-number">03</span>
            <h4>Start Frontend</h4>
            <p>Launch Angular dev server with hot reload and proxying.</p>
            <pre><code>npm run dev:frontend</code></pre>
          </div>
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .home-page {
      padding: 3rem 0;
    }

    .hero {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 4rem auto;

      .badge-pill {
        display: inline-block;
        padding: 0.35rem 0.9rem;
        background: var(--primary-light, rgba(59, 130, 246, 0.15));
        color: var(--primary-color, var(--primary));
        border: 1px solid var(--border-theme-color, rgba(59, 130, 246, 0.3));
        border-radius: var(--radius-pill, 9999px);
        font-size: var(--font-size-xs, 0.8rem);
        font-weight: var(--font-weight-semibold, 600);
        margin-bottom: 1.5rem;
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--font-size-4xl, 3rem);
        font-weight: var(--font-weight-extrabold, 800);
        letter-spacing: -0.025em;
        line-height: var(--line-height-tight, 1.15);
        margin-bottom: 1.25rem;
        background: linear-gradient(135deg, #ffffff 0%, #9ca3af 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        font-family: var(--font-sans);
        font-size: var(--font-size-lg, 1.15rem);
        color: var(--text-secondary-color, var(--text-secondary));
        margin-bottom: 2rem;
        line-height: var(--line-height-relaxed, 1.6);

        strong {
          color: var(--text-color, var(--text-primary));
        }
      }

      .hero-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
      }
    }

    .card {
      background-color: var(--background-card-color, var(--bg-card));
      border: 1px solid var(--border-theme-color, var(--border-color));
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.2s ease, transform 0.2s ease;

      &:hover {
        border-color: var(--border-strong, var(--text-muted));
        transform: translateY(-2px);
      }
    }

    .guide-section {
      h2 {
        font-family: var(--font-display);
        font-size: var(--font-size-xl, 1.5rem);
        font-weight: var(--font-weight-bold, 700);
        color: var(--text-color, var(--text-primary));
        margin-bottom: 1.5rem;
        text-align: center;
      }

      .steps-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .step-card {
        position: relative;
        .step-number {
          font-family: var(--font-display);
          font-size: var(--font-size-xl, 1.5rem);
          font-weight: var(--font-weight-extrabold, 800);
          color: var(--ice-blue, var(--primary));
          margin-bottom: 0.5rem;
          display: block;
        }

        h4 {
          font-family: var(--font-display);
          font-size: var(--font-size-md, 1.1rem);
          color: var(--text-color, var(--text-primary));
          margin-bottom: 0.5rem;
        }

        p {
          font-family: var(--font-sans);
          color: var(--text-secondary-color, var(--text-secondary));
          font-size: var(--font-size-sm, 0.875rem);
          margin-bottom: 1rem;
        }

        pre {
          background-color: var(--background-primary-color, var(--bg-main));
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: var(--font-size-xs, 0.8rem);
          color: var(--ice-blue, #38bdf8);
          overflow-x: auto;
        }
      }
    }
  `],
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthService);

  readonly section1Config: SectionConfig = {
    align: 'left',
    title: 'Historia, Equipos y Tradición de la LVBP',
    description:
      'Explora las franquicias históricas del béisbol venezolano: Leones del Caracas, Navegantes del Magallanes, Tiburones de La Guaira, Tigres de Aragua, Cardenales de Lara, Águilas del Zulia, Caribes de Anzoátegui y Bravos de Margarita.',
    media: {
      image:
        'https://images.unsplash.com/photo-1508344928928-7165b67de128?q=80&w=1080&auto=format&fit=crop',
      text: 'Enciclopedia de la Pelota Criolla',
      alt: 'Béisbol Profesional Venezolano',
    },
  };

  readonly section2Config: SectionConfig = {
    align: 'right',
    title: 'Estadísticas Históricas y Jugadores Legendarios',
    description:
      'Consulta récords de por vida, lideratos individuales de bateo y pitcheo, campeonatos de la LVBP y trayectorias de peloteros venezolanos en las Grandes Ligas y el Caribe.',
    media: {
      image:
        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1080&auto=format&fit=crop',
      text: 'El Dugout Ve - Datos y Récords',
      alt: 'Estadísticas del Béisbol Venezolano',
    },
  };

  readonly systemHealthCardsConfig: SectionCardsConfig = DEFAULT_SECTION_CARDS_CONFIG;

  onSubscribe(): void {
    if (!this.authService.isLoggedIn()) {
      const dialogRef = this.dialog.open(SignUpDialogComponent, {
        width: '560px',
        maxWidth: '95vw',
        panelClass: 'signup-dialog-panel',
        autoFocus: false,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result && this.authService.isLoggedIn()) {
          this.openSubscriptionDialog();
        }
      });
      return;
    }

    this.openSubscriptionDialog();
  }

  private openSubscriptionDialog(): void {
    this.dialog.open(SubscriptionDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'subscription-dialog-panel',
      autoFocus: false,
    });
  }

  onCall(): void {
    window.open('https://cloud.google.com/run', '_blank');
  }
}
