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
  template: `
    @if (canView()) {
      <div class="section-cards-container">
        @if (effectiveConfig().indicatorText; as indicator) {
          <div class="admin-indicator">
            <span class="admin-badge">
              <span class="admin-badge-dot"></span>
              {{ indicator | translate }}
            </span>
          </div>
        }

        <section class="status-grid">
          @for (card of effectiveConfig().cards; track card.id || card.title) {
            <div class="card status-card">
              <div class="card-header">
                <h3>{{ card.title | translate }}</h3>
                @if (getCardBadge(card); as badge) {
                  <app-status-badge
                    [text]="badge.text | translate"
                    [type]="badge.type || 'neutral'">
                  </app-status-badge>
                }
              </div>

              @if (card.description) {
                <p class="card-desc">
                  {{ card.description | translate }}
                </p>
              }

              @if (card.footerCode || card.footerButton || card.footerText) {
                <div class="card-footer">
                  @if (card.footerCode) {
                    <code>{{ card.footerCode | translate }}</code>
                  }

                  @if (card.footerButton) {
                    <button
                      type="button"
                      (click)="onCardButtonClick(card)"
                      class="btn-refresh"
                      [disabled]="isCardButtonDisabled(card)">
                      {{ getCardButtonLabel(card) | translate }}
                    </button>
                  }

                  @if (card.footerText) {
                    <span class="footer-text">{{ card.footerText | translate }}</span>
                  }
                </div>
              }
            </div>
          }
        </section>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .section-cards-container {
      width: 100%;
      margin: 2rem 0;
    }

    .admin-indicator {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 1rem;
    }

    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-pill, 9999px);
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-semibold, 600);
      letter-spacing: 0.03em;
      text-transform: uppercase;
      background: var(--primary-light, rgba(14, 165, 233, 0.12));
      border: 1px solid var(--border-subtle, rgba(14, 165, 233, 0.25));
      color: var(--ice-blue, #38bdf8);

      .admin-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: var(--ice-blue, #38bdf8);
        box-shadow: 0 0 6px var(--ice-blue, #38bdf8);
      }
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background-color: var(--background-card-color, #1e293b);
      border: 1px solid var(--border-theme-color, rgba(255, 255, 255, 0.1));
      border-radius: var(--radius-md, 0.75rem);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.2s ease, transform 0.2s ease;

      &:hover {
        border-color: var(--border-strong, #64748b);
        transform: translateY(-2px);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;

        h3 {
          font-family: var(--font-display);
          font-size: var(--font-size-md, 1.05rem);
          font-weight: var(--font-weight-semibold, 600);
          color: var(--text-color, #ffffff);
          margin: 0;
        }
      }

      .card-desc {
        font-family: var(--font-sans);
        color: var(--text-secondary-color, #94a3b8);
        font-size: var(--font-size-sm, 0.875rem);
        margin-bottom: 1.25rem;
        line-height: 1.5;
      }

      .card-footer {
        padding-top: 0.75rem;
        border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));

        code {
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--text-muted-color, #64748b);
        }

        .footer-text {
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--text-muted-color, #64748b);
        }

        .btn-refresh {
          background: none;
          border: none;
          color: var(--primary-color, #3b82f6);
          font-size: var(--font-size-xs, 0.8rem);
          cursor: pointer;
          font-weight: 500;
          padding: 0;
          transition: color 0.2s ease;

          &:hover:not(:disabled) {
            color: var(--primary-hover, #60a5fa);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }
  `],
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
