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
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.scss',
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
