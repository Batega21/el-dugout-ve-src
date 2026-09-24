import {
  Component,
  ChangeDetectionStrategy,
  input,
  computed,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { StatRecordItem, DEFAULT_STAT_RECORDS } from './stats-strip.interface';
import { LeaderboardsService } from '../../../core/services/leaderboards.service';

@Component({
  selector: 'app-stats-strip',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.full-width]': 'fullWidth()',
  },
  templateUrl: './stats-strip.component.html',
  styleUrl: './stats-strip.component.scss',
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
