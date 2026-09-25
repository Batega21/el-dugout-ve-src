import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  BattingCategory,
  BattingPlayerStat,
  CategoryTab,
  PageSizeOption,
  PitchingCategory,
  PitchingPlayerStat,
  SortDirection,
} from '../../core/models/statistics.model';
import { StatisticsService } from '../../core/services/statistics.service';

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPageComponent implements OnInit {
  private readonly statisticsService = inject(StatisticsService);
  private readonly destroyRef = inject(DestroyRef);

  // ---------------------------------------------------------------------------
  // 1. Batting State Signals (Strictly matching Technical Requirements)
  // ---------------------------------------------------------------------------
  readonly selectedBattingCategory = signal<'HR' | 'H' | 'AVG' | 'SB'>('HR');
  readonly battingPage = signal<number>(1);
  readonly battingPageSize = signal<10 | 20 | 50>(10);
  readonly battingSortColumn = signal<string>('value');
  readonly battingSortDirection = signal<'asc' | 'desc'>('desc');
  readonly isBattingLoading = signal<boolean>(false);

  // Raw dataset store for batting
  readonly allBattingPlayers = signal<BattingPlayerStat[]>([]);

  // ---------------------------------------------------------------------------
  // 2. Pitching State Signals (Strictly matching Technical Requirements)
  // ---------------------------------------------------------------------------
  readonly selectedPitchingCategory = signal<'W' | 'SO' | 'SV'>('W');
  readonly pitchingPage = signal<number>(1);
  readonly pitchingPageSize = signal<10 | 20 | 50>(10);
  readonly pitchingSortColumn = signal<string>('value');
  readonly pitchingSortDirection = signal<'asc' | 'desc'>('desc');
  readonly isPitchingLoading = signal<boolean>(false);

  // Raw dataset store for pitching
  readonly allPitchingPlayers = signal<PitchingPlayerStat[]>([]);

  // Page size selector options
  readonly pageSizeOptions: PageSizeOption[] = [10, 20, 50];

  // Placeholder skeleton rows for zero-layout-shift loading states
  readonly skeletonRows = Array.from({ length: 10 }, (_, i) => i);

  // ---------------------------------------------------------------------------
  // Category Pill/Tab Definitions
  // ---------------------------------------------------------------------------
  readonly battingTabs: CategoryTab<BattingCategory>[] = [
    {
      id: 'HR',
      labelKey: 'STATISTICS_PAGE.TABS.HR',
      metricLabelKey: 'STATISTICS_PAGE.COLUMNS.HR',
      shortCode: 'HR',
    },
    {
      id: 'H',
      labelKey: 'STATISTICS_PAGE.TABS.H',
      metricLabelKey: 'STATISTICS_PAGE.COLUMNS.H',
      shortCode: 'H',
    },
    {
      id: 'AVG',
      labelKey: 'STATISTICS_PAGE.TABS.AVG',
      metricLabelKey: 'STATISTICS_PAGE.COLUMNS.AVG',
      shortCode: 'AVG',
    },
    {
      id: 'SB',
      labelKey: 'STATISTICS_PAGE.TABS.SB',
      metricLabelKey: 'STATISTICS_PAGE.COLUMNS.SB',
      shortCode: 'SB',
    },
  ];

  readonly pitchingTabs: CategoryTab<PitchingCategory>[] = [
    {
      id: 'W',
      labelKey: 'STATISTICS_PAGE.TABS.W',
      metricLabelKey: 'STATISTICS_PAGE.COLUMNS.W',
      shortCode: 'W',
    },
    {
      id: 'SO',
      labelKey: 'STATISTICS_PAGE.TABS.SO',
      metricLabelKey: 'STATISTICS_PAGE.COLUMNS.SO',
      shortCode: 'SO',
    },
    {
      id: 'SV',
      labelKey: 'STATISTICS_PAGE.TABS.SV',
      metricLabelKey: 'STATISTICS_PAGE.COLUMNS.SV',
      shortCode: 'SV',
    },
  ];

  // ---------------------------------------------------------------------------
  // Computed Signals - Batting
  // ---------------------------------------------------------------------------
  readonly sortedBattingPlayers = computed(() => {
    const players = [...this.allBattingPlayers()];
    const column = this.battingSortColumn();
    const direction = this.battingSortDirection();
    const factor = direction === 'asc' ? 1 : -1;

    return players.sort((a, b) => {
      if (column === 'player') {
        return a.player.localeCompare(b.player, undefined, { sensitivity: 'base' }) * factor;
      }
      if (column === 'seasons') {
        return (a.startYear - b.startYear) * factor;
      }
      if (column === 'games') {
        return (a.games - b.games) * factor;
      }
      if (column === 'atBats') {
        return (a.atBats - b.atBats) * factor;
      }
      // Primary/active metric column
      const valA = this.selectedBattingCategory() === 'AVG' ? a.avgValue : a.value;
      const valB = this.selectedBattingCategory() === 'AVG' ? b.avgValue : b.value;
      return (valA - valB) * factor;
    });
  });

  readonly totalBattingCount = computed(() => this.sortedBattingPlayers().length);

  readonly battingTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalBattingCount() / this.battingPageSize())),
  );

  readonly paginatedBattingPlayers = computed(() => {
    const page = this.battingPage();
    const size = this.battingPageSize();
    const start = (page - 1) * size;
    return this.sortedBattingPlayers().slice(start, start + size);
  });

  readonly battingStartIndex = computed(() => {
    if (this.totalBattingCount() === 0) return 0;
    return (this.battingPage() - 1) * this.battingPageSize() + 1;
  });

  readonly battingEndIndex = computed(() =>
    Math.min(this.battingPage() * this.battingPageSize(), this.totalBattingCount()),
  );

  readonly activeBattingTab = computed(() =>
    this.battingTabs.find((t) => t.id === this.selectedBattingCategory()) || this.battingTabs[0],
  );

  // ---------------------------------------------------------------------------
  // Computed Signals - Pitching
  // ---------------------------------------------------------------------------
  readonly sortedPitchingPlayers = computed(() => {
    const players = [...this.allPitchingPlayers()];
    const column = this.pitchingSortColumn();
    const direction = this.pitchingSortDirection();
    const factor = direction === 'asc' ? 1 : -1;

    return players.sort((a, b) => {
      if (column === 'player') {
        return a.player.localeCompare(b.player, undefined, { sensitivity: 'base' }) * factor;
      }
      if (column === 'seasons') {
        return (a.startYear - b.startYear) * factor;
      }
      if (column === 'ip') {
        return (a.ipValue - b.ipValue) * factor;
      }
      if (column === 'era') {
        return (a.eraValue - b.eraValue) * factor;
      }
      // Primary/active metric column
      return (a.value - b.value) * factor;
    });
  });

  readonly totalPitchingCount = computed(() => this.sortedPitchingPlayers().length);

  readonly pitchingTotalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalPitchingCount() / this.pitchingPageSize())),
  );

  readonly paginatedPitchingPlayers = computed(() => {
    const page = this.pitchingPage();
    const size = this.pitchingPageSize();
    const start = (page - 1) * size;
    return this.sortedPitchingPlayers().slice(start, start + size);
  });

  readonly pitchingStartIndex = computed(() => {
    if (this.totalPitchingCount() === 0) return 0;
    return (this.pitchingPage() - 1) * this.pitchingPageSize() + 1;
  });

  readonly pitchingEndIndex = computed(() =>
    Math.min(this.pitchingPage() * this.pitchingPageSize(), this.totalPitchingCount()),
  );

  readonly activePitchingTab = computed(() =>
    this.pitchingTabs.find((t) => t.id === this.selectedPitchingCategory()) || this.pitchingTabs[0],
  );

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------
  ngOnInit(): void {
    this.loadBattingData();
    this.loadPitchingData();
  }

  // ---------------------------------------------------------------------------
  // Batting Actions & Handlers
  // ---------------------------------------------------------------------------
  setBattingCategory(cat: BattingCategory): void {
    if (this.selectedBattingCategory() === cat) return;
    this.selectedBattingCategory.set(cat);
    this.battingPage.set(1);
    this.battingSortColumn.set('value');
    this.battingSortDirection.set('desc');
    this.loadBattingData();
  }

  toggleBattingSort(column: string): void {
    if (this.battingSortColumn() === column) {
      // Toggle sort direction
      const nextDir: SortDirection = this.battingSortDirection() === 'asc' ? 'desc' : 'asc';
      this.battingSortDirection.set(nextDir);
    } else {
      this.battingSortColumn.set(column);
      // Alphabetical and chronological default to ascending; numerical defaults to descending
      const defaultDir: SortDirection = column === 'player' || column === 'seasons' ? 'asc' : 'desc';
      this.battingSortDirection.set(defaultDir);
    }
  }

  setBattingPageSize(size: 10 | 20 | 50): void {
    this.battingPageSize.set(size);
    this.battingPage.set(1);
  }

  prevBattingPage(): void {
    if (this.battingPage() > 1) {
      this.battingPage.update((p) => p - 1);
    }
  }

  nextBattingPage(): void {
    if (this.battingPage() < this.battingTotalPages()) {
      this.battingPage.update((p) => p + 1);
    }
  }

  loadBattingData(): void {
    this.isBattingLoading.set(true);
    this.statisticsService
      .getBattingLeaders(this.selectedBattingCategory())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.allBattingPlayers.set(data);
          this.isBattingLoading.set(false);
        },
        error: () => {
          this.isBattingLoading.set(false);
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Pitching Actions & Handlers
  // ---------------------------------------------------------------------------
  setPitchingCategory(cat: PitchingCategory): void {
    if (this.selectedPitchingCategory() === cat) return;
    this.selectedPitchingCategory.set(cat);
    this.pitchingPage.set(1);
    this.pitchingSortColumn.set('value');
    this.pitchingSortDirection.set('desc');
    this.loadPitchingData();
  }

  togglePitchingSort(column: string): void {
    if (this.pitchingSortColumn() === column) {
      const nextDir: SortDirection = this.pitchingSortDirection() === 'asc' ? 'desc' : 'asc';
      this.pitchingSortDirection.set(nextDir);
    } else {
      this.pitchingSortColumn.set(column);
      const defaultDir: SortDirection = column === 'player' || column === 'seasons' ? 'asc' : 'desc';
      this.pitchingSortDirection.set(defaultDir);
    }
  }

  setPitchingPageSize(size: 10 | 20 | 50): void {
    this.pitchingPageSize.set(size);
    this.pitchingPage.set(1);
  }

  prevPitchingPage(): void {
    if (this.pitchingPage() > 1) {
      this.pitchingPage.update((p) => p - 1);
    }
  }

  nextPitchingPage(): void {
    if (this.pitchingPage() < this.pitchingTotalPages()) {
      this.pitchingPage.update((p) => p + 1);
    }
  }

  loadPitchingData(): void {
    this.isPitchingLoading.set(true);
    this.statisticsService
      .getPitchingLeaders(this.selectedPitchingCategory())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.allPitchingPlayers.set(data);
          this.isPitchingLoading.set(false);
        },
        error: () => {
          this.isPitchingLoading.set(false);
        },
      });
  }

  // ---------------------------------------------------------------------------
  // Franchise Badge Styling Helper
  // ---------------------------------------------------------------------------
  getTeamBadgeClass(team: string): string {
    const t = team.toLowerCase();
    if (t.includes('caracas') || t.includes('leones')) return 'badge-team-caracas';
    if (t.includes('magallanes') || t.includes('navegantes')) return 'badge-team-magallanes';
    if (t.includes('la guaira') || t.includes('tiburones')) return 'badge-team-tiburones';
    if (t.includes('tigres') || t.includes('aragua')) return 'badge-team-tigres';
    if (t.includes('lara') || t.includes('cardenales')) return 'badge-team-cardenales';
    if (t.includes('zulia') || t.includes('águilas') || t.includes('aguilas')) return 'badge-team-aguilas';
    if (t.includes('caribes') || t.includes('anzoátegui') || t.includes('anzoategui')) return 'badge-team-caribes';
    if (t.includes('bravos') || t.includes('margarita')) return 'badge-team-bravos';
    if (t.includes('pastora')) return 'badge-team-pastora';
    return 'badge-team-default';
  }
}
