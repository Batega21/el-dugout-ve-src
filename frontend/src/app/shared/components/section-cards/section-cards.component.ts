import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { HealthService } from '../../../core/services/health.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import {
  SectionCardsConfig,
  SectionCardItem,
  SectionCardBadge,
  DEFAULT_SECTION_CARDS_CONFIG,
} from './section-cards.interface';

@Component({
  selector: 'app-section-cards',
  standalone: true,
  imports: [StatusBadgeComponent, TranslatePipe],
  templateUrl: './section-cards.component.html',
  styleUrl: './section-cards.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionCardsComponent implements OnInit {
  private readonly healthService = inject(HealthService);
  private readonly authService = inject(AuthService);

  // Strongly-typed configuration input (matching footer pattern: <app-section-cards [config]="mySectionCardsData"></app-section-cards>)
  readonly config = input<SectionCardsConfig>(DEFAULT_SECTION_CARDS_CONFIG);

  // Optional override for testing or manual visibility control
  readonly forceVisible = input<boolean | null>(null, { alias: 'force-visible' });

  // Output for interactive card button clicks
  readonly cardAction = output<{ card: SectionCardItem; action: string }>();

  // Effective configuration (defaults to system health matrix if not supplied)
  readonly effectiveConfig = computed<SectionCardsConfig>(() => {
    return this.config() || DEFAULT_SECTION_CARDS_CONFIG;
  });

  // Only visible for logged-in admin users (if adminOnly is true) or if forceVisible is set
  readonly canView = computed(() => {
    const forced = this.forceVisible();
    if (forced !== null) {
      return forced;
    }
    const cfg = this.effectiveConfig();
    if (cfg.adminOnly) {
      return this.authService.isAdmin();
    }
    return true;
  });

  readonly apiStatus = signal<'Connected' | 'Disconnected' | 'Checking...'>('Checking...');
  readonly dbStatus = signal<'Connected' | 'Down' | 'Checking...'>('Checking...');
  readonly loadingHealth = signal<boolean>(false);

  ngOnInit(): void {
    if (this.canView()) {
      this.checkHealth();
    }
  }

  getCardBadge(card: SectionCardItem): SectionCardBadge | undefined {
    if (card.id === 'backend') {
      return {
        text: this.apiStatus(),
        type: this.apiStatus() === 'Connected' ? 'success' : 'danger',
      };
    }
    if (card.id === 'database') {
      return {
        text: this.dbStatus(),
        type: this.dbStatus() === 'Connected' ? 'success' : 'warning',
      };
    }
    return card.badge;
  }

  getCardButtonLabel(card: SectionCardItem): string {
    if (card.footerButton?.action === 'refresh-health' || card.id === 'backend') {
      return this.loadingHealth()
        ? 'Pinging...'
        : card.footerButton?.label || 'Check Health Probes ↻';
    }
    return card.footerButton?.label || '';
  }

  isCardButtonDisabled(card: SectionCardItem): boolean {
    if (card.footerButton?.action === 'refresh-health' || card.id === 'backend') {
      return this.loadingHealth() || Boolean(card.footerButton?.disabled);
    }
    return Boolean(card.footerButton?.disabled);
  }

  onCardButtonClick(card: SectionCardItem): void {
    const action = card.footerButton?.action || 'click';
    if (action === 'refresh-health' || card.id === 'backend') {
      this.checkHealth();
    }
    this.cardAction.emit({ card, action });
  }

  checkHealth(): void {
    this.loadingHealth.set(true);
    this.healthService.getHealth().subscribe({
      next: (res) => {
        this.loadingHealth.set(false);
        if (res && res.status === 'ok') {
          this.apiStatus.set('Connected');
          const isDbUp =
            res.info?.['database']?.['status'] === 'up' ||
            res.details?.['database']?.['status'] === 'up';
          this.dbStatus.set(isDbUp ? 'Connected' : 'Down');
        } else {
          this.apiStatus.set('Disconnected');
          this.dbStatus.set('Down');
        }
      },
      error: () => {
        this.loadingHealth.set(false);
        this.apiStatus.set('Disconnected');
        this.dbStatus.set('Down');
      },
    });
  }
}
