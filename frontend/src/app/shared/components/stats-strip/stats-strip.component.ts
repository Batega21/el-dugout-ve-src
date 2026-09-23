import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatRecordItem, DEFAULT_STAT_RECORDS } from './stats-strip.interface';
import { LeaderboardsService } from '../../../core/services/leaderboards.service';

@Component({
  selector: 'app-stats-strip',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.full-width]': 'fullWidth()',
  },
  template: `
    <!-- STATS STRIP -->
    <div class="stats-strip" role="region" aria-label="Récords de la LVBP">
      <div class="strip-inner" id="strip">
        @for (item of duplicatedItems(); track $index) {
          <div class="strip-item">
            <span class="si-label">{{ item.label }}</span>
            <span class="si-val">{{ item.value }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      margin: 1.5rem 0 3.5rem 0;

      &.full-width {
        width: 100vw;
        position: relative;
        left: 50%;
        right: 50%;
        margin-left: -50vw;
        margin-right: -50vw;
      }
    }

    .stats-strip {
      background: var(--rojo, #b91c1c);
      color: #ffffff;
      padding: 20px 0;
      overflow: hidden;
      user-select: none;

      &:hover .strip-inner {
        animation-play-state: paused;
      }
    }

    .strip-inner {
      display: flex;
      gap: 0;
      max-width: none;
      animation: marquee 30s linear infinite;
      white-space: nowrap;
      width: max-content;
    }

    @keyframes marquee {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    .strip-item {
      display: inline-flex;
      align-items: center;
      gap: 20px;
      padding: 0 40px;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .strip-item .si-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.7;
    }

    .strip-item .si-val {
      font-family: var(--font-heading, 'Bebas Neue', sans-serif);
      font-size: 20px;
      letter-spacing: 1px;
    }

    .strip-sep {
      opacity: 0.3;
      font-size: 20px;
      padding: 0 10px;
    }

    @media (prefers-reduced-motion: reduce) {
      .strip-inner {
        animation: none;
        overflow-x: auto;
      }
    }
  `],
})
export class StatsStripComponent implements OnInit {
  private readonly leaderboardsService = inject(LeaderboardsService, { optional: true });

  /**
   * Optional manual override for records. If not provided, retrieves top records from database.
   */
  readonly customItems = input<StatRecordItem[] | undefined>(undefined, { alias: 'items' });

  /**
   * Database-fetched records signal, initialized to DEFAULT_STAT_RECORDS as fallback.
   */
  readonly dbRecords = signal<StatRecordItem[]>(DEFAULT_STAT_RECORDS);

  /**
   * Active list of statistical records (custom override takes precedence if supplied).
   */
  readonly items = computed(() => this.customItems() ?? this.dbRecords());

  /**
   * Whether to stretch the banner to full viewport width. Defaults to true.
   */
  readonly fullWidth = input<boolean>(true);

  /**
   * Duplicated items to produce a seamless, continuous marquee animation cycle (-50% transform).
   */
  readonly duplicatedItems = computed(() => {
    const list = this.items();
    if (!list || list.length === 0) {
      return [];
    }
    return [...list, ...list];
  });

  ngOnInit(): void {
    if (this.leaderboardsService && !this.customItems()) {
      this.leaderboardsService.getTopRecords().subscribe({
        next: (records) => {
          if (records && records.length > 0) {
            this.dbRecords.set(records);
          }
        },
        error: () => {
          // Gracefully retain DEFAULT_STAT_RECORDS fallback
        },
      });
    }
  }
}
