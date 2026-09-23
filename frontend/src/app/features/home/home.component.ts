import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { HeroComponent } from '../../shared/components/hero/hero.component';
import { HistoricalRecordsComponent } from '../../shared/components/historical-records/historical-records.component';
import { StatsStripComponent } from '../../shared/components/stats-strip/stats-strip.component';
import { SectionComponent } from '../../shared/components/section/section.component';
import { LeaderTableCarouselComponent } from '../../shared/components/leader-table-carousel/leader-table-carousel.component';
import { SectionConfig } from '../../shared/components/section/section.interface';
import {
  LeaderCarouselConfig,
  DEFAULT_BATTING_RECORDS_CONFIG,
  DEFAULT_PITCHING_RECORDS_CONFIG,
} from '../../shared/components/leader-table-carousel/leader-table-carousel.interface';
import { SubscriptionDialogComponent } from '../../shared/components/subscription-dialog/subscription-dialog.component';
import { SignUpDialogComponent } from '../../shared/components/sign-up-dialog/sign-up-dialog.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    HistoricalRecordsComponent,
    StatsStripComponent,
    LeaderTableCarouselComponent,
    SectionComponent,
  ],
  template: `
    <div class="home-page">
      <!-- Hero Component matching wireframe reference -->
      <app-hero
        (primaryAction)="onSubscribe()"
        (secondaryAction)="onCall()">
      </app-hero>

      <!-- 1. Stats Strip Component: Top Records of Each Category -->
      <app-stats-strip></app-stats-strip>

      <!-- 2. First Section of Home Page: Historical Records with Lazy On-Viewport Fetching -->
      @defer (on viewport) {
        <app-historical-records></app-historical-records>
      } @placeholder {
        <div class="records-viewport-placeholder min-h-[360px]" aria-hidden="true"></div>
      }

      <!-- 3. Instance 1: All-Time Career Batting Records Carousel with Edge Gradients & SVG Controls -->
      <app-leader-table-carousel [config]="battingRecordsConfig"></app-leader-table-carousel>

      <!-- 4. Section Components (Config-Driven 60/40 Split, Alignment & Layered Media) -->
      <app-section [config]="section1Config"></app-section>

      <!-- 5. Instance 2: All-Time Career Pitching Records Carousel with Edge Gradients & SVG Controls -->
      <app-leader-table-carousel [config]="pitchingRecordsConfig"></app-leader-table-carousel>

      <!-- 6. Section Components (Config-Driven 60/40 Split, Alignment & Layered Media) -->
      <app-section [config]="section2Config"></app-section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .home-page {
      padding: 0;
    }

    .hero {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 4rem auto;

      .badge-pill {
        display: inline-block;
        padding: 0.35rem 0.9rem;
        background: var(--primary-light, rgba(239, 68, 68, 0.15));
        color: var(--primary-color, var(--primary));
        border: 1px solid var(--border-theme-color, rgba(239, 68, 68, 0.3));
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
        color: var(--hero-title-color, var(--text-color, var(--text-primary)));
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

  readonly battingRecordsConfig: LeaderCarouselConfig = DEFAULT_BATTING_RECORDS_CONFIG;
  readonly pitchingRecordsConfig: LeaderCarouselConfig = DEFAULT_PITCHING_RECORDS_CONFIG;

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
