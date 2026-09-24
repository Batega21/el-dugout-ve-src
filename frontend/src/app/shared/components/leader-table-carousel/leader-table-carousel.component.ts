import {
  Component,
  ChangeDetectionStrategy,
  input,
  signal,
  computed,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LeaderCarouselConfig,
  LeaderTableCard,
  DEFAULT_BATTING_RECORDS_CONFIG,
} from './leader-table-carousel.interface';

interface RenderedSlide {
  originalIndex: number;
  table: LeaderTableCard;
  isClone?: boolean;
}

@Component({
  selector: 'app-leader-table-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './leader-table-carousel.component.html',
  styleUrl: './leader-table-carousel.component.scss',
})
export class LeaderTableCarouselComponent {
  // Configuration input
  readonly config = input<LeaderCarouselConfig>(DEFAULT_BATTING_RECORDS_CONFIG);

  // Fallback / direct inputs
  readonly badge = input<string | undefined>(undefined);
  readonly title = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);

  // DOM element references
  readonly trackWrapper = viewChild<ElementRef<HTMLElement>>('trackWrapper');

  // Active track index (1-based when loop is enabled due to prepended clone)
  readonly trackIndex = signal<number>(1);

  // Transition enabled state (temporarily disabled during instant clone resets)
  readonly enableTransition = signal<boolean>(true);

  // Loading state
  readonly isLoading = signal<boolean>(false);

  // Touch tracking for swipe gestures
  private touchStartX = 0;
  private touchStartY = 0;
  private touchDeltaX = 0;

  // Effective configuration merged with direct inputs
  readonly effectiveConfig = computed<LeaderCarouselConfig>(() => {
    const base = this.config() || DEFAULT_BATTING_RECORDS_CONFIG;
    return {
      ...base,
      badge: this.badge() ?? base.badge,
      title: this.title() ?? base.title,
      subtitle: this.subtitle() ?? base.subtitle,
      loop: base.loop !== false,
    };
  });

  // Original tables list
  readonly originalTables = computed<LeaderTableCard[]>(() => {
    return this.effectiveConfig().tables || [];
  });

  // Loop enabled flag
  readonly isLoopEnabled = computed<boolean>(() => {
    const tables = this.originalTables();
    return this.effectiveConfig().loop !== false && tables.length > 1;
  });

  // Generated slides array (includes clones at both ends when loop is true)
  readonly slides = computed<RenderedSlide[]>(() => {
    const tables = this.originalTables();
    if (tables.length === 0) return [];

    if (!this.isLoopEnabled()) {
      return tables.map((table, idx) => ({
        originalIndex: idx,
        table,
      }));
    }

    const lastTable = tables[tables.length - 1];
    const firstTable = tables[0];

    const rendered: RenderedSlide[] = [
      { originalIndex: tables.length - 1, table: lastTable, isClone: true },
      ...tables.map((table, idx) => ({ originalIndex: idx, table })),
      { originalIndex: 0, table: firstTable, isClone: true },
    ];

    return rendered;
  });

  // Current logical active index (0 to tables.length - 1)
  readonly currentIndex = computed<number>(() => {
    const tables = this.originalTables();
    const count = tables.length;
    if (count === 0) return 0;

    if (!this.isLoopEnabled()) {
      return Math.max(0, Math.min(this.trackIndex(), count - 1));
    }

    const tIdx = this.trackIndex();
    if (tIdx === 0) return count - 1;
    if (tIdx === count + 1) return 0;
    return tIdx - 1;
  });

  // Active category computed string
  readonly activeCategory = computed<string>(() => {
    const tables = this.originalTables();
    const current = tables[this.currentIndex()];
    return current ? current.categoryTitle : '';
  });

  // Computed CSS transform for hardware acceleration
  readonly trackTransform = computed<string>(() => {
    const idx = this.trackIndex();
    // Move track by: -idx * (cardWidth + gap)
    return `translate3d(calc(-${idx} * (var(--slide-width) + var(--slide-gap))), 0, 0)`;
  });

  // Check if navigation can proceed backwards
  readonly canGoPrev = computed<boolean>(() => {
    if (this.isLoopEnabled()) return true;
    return this.trackIndex() > 0;
  });

  // Check if navigation can proceed forwards
  readonly canGoNext = computed<boolean>(() => {
    if (this.isLoopEnabled()) return true;
    return this.trackIndex() < this.originalTables().length - 1;
  });

  /**
   * Navigate to the previous table.
   */
  prev(): void {
    if (!this.canGoPrev()) return;
    this.enableTransition.set(true);
    this.trackIndex.update((i) => i - 1);
  }

  /**
   * Navigate to the next table.
   */
  next(): void {
    if (!this.canGoNext()) return;
    this.enableTransition.set(true);
    this.trackIndex.update((i) => i + 1);
  }

  /**
   * Jump directly to a specific original table index.
   */
  goTo(targetIndex: number): void {
    const tables = this.originalTables();
    if (targetIndex < 0 || targetIndex >= tables.length) return;

    this.enableTransition.set(true);
    if (this.isLoopEnabled()) {
      this.trackIndex.set(targetIndex + 1);
    } else {
      this.trackIndex.set(targetIndex);
    }
  }

  /**
   * Handle seamless infinite looping when sliding reaches prepended or appended clones.
   */
  onTransitionEnd(): void {
    if (!this.isLoopEnabled()) return;

    const count = this.originalTables().length;
    const current = this.trackIndex();

    // If we transitioned to the clone before the first item (index 0)
    if (current === 0) {
      this.enableTransition.set(false);
      this.trackIndex.set(count);
    }
    // If we transitioned to the clone after the last item (index count + 1)
    else if (current === count + 1) {
      this.enableTransition.set(false);
      this.trackIndex.set(1);
    }
  }

  /**
   * Checks if a slide in the slides array is the centered active slide.
   */
  isSlideActive(slideIndex: number): boolean {
    return slideIndex === this.trackIndex();
  }

  /**
   * Lazy loading visibility check: only active and adjacent slides render full tables.
   */
  isSlideVisible(slideIndex: number): boolean {
    const diff = Math.abs(slideIndex - this.trackIndex());
    return diff <= 1;
  }

  /**
   * Keyboard navigation (ArrowLeft & ArrowRight).
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  /**
   * Touch swipe gesture detection on mobile devices.
   */
  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
    this.touchDeltaX = 0;
  }

  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchDeltaX = touch.clientX - this.touchStartX;
  }

  onTouchEnd(): void {
    const threshold = 40;
    if (this.touchDeltaX > threshold) {
      this.prev();
    } else if (this.touchDeltaX < -threshold) {
      this.next();
    }
    this.touchDeltaX = 0;
  }
}
