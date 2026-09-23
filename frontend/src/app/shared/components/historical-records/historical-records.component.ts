import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  viewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { RecordsService } from '../../../core/services/records.service';
import { HistoricalRecordDto } from '../../../core/models/record.model';

@Component({
  selector: 'app-historical-records',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="records" class="records-section" #recordsViewport>
      <div class="container mx-auto px-4 py-12">
        <!-- Section Label / Tagline -->
        <div class="flex items-center gap-3 mb-2">
          <div class="records-tag-bar"></div>
          <span class="records-tag">
            {{ 'RECORDS.TAG' | translate }}
          </span>
        </div>

        <!-- Section Title & Subtitle -->
        <h2 class="records-title">
          {{ 'RECORDS.TITLE' | translate }}
        </h2>
        <p class="records-subtitle">
          {{ 'RECORDS.SUBTITLE' | translate }}
        </p>

        <!-- Records Grid Container -->
        @if (isLoading()) {
          <div class="records-grid">
            @for (item of [1, 2, 3, 4, 5, 6, 7, 8]; track item) {
              <div class="animate-pulse bg-[#121216] border border-[#1f2937] rounded-lg p-6 h-44"></div>
            }
          </div>
        } @else if (records().length > 0) {
          <div class="records-grid">
            @for (record of records(); track record.id) {
              <div class="rec-card group relative">
                <!-- Numeric Record Value -->
                <span class="record-value">
                  {{ record.value }}
                </span>
                <!-- Metric Name / Label -->
                <div class="record-label">
                  {{ record.label }}
                </div>
                <!-- Record Holder Name -->
                <div class="record-holder">
                  {{ record.holder }}
                </div>
                <!-- Year / Season -->
                <div class="record-year">
                  {{ record.year }}
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="records-empty">
            {{ 'RECORDS.EMPTY' | translate }}
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .records-section {
        display: block;
        width: 100%;
        position: relative;
        background-color: var(--bg-main, #0b0f19);
        color: var(--text-primary, #f9fafb);
        transition: background-color var(--transition-normal, 250ms ease);
      }

      .container {
        max-width: var(--wrap-max-width, 1200px);
        margin: 0 auto;
        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 3rem;
        padding-bottom: 3rem;
      }

      .flex {
        display: flex;
      }

      .items-center {
        align-items: center;
      }

      .gap-3 {
        gap: 0.75rem;
      }

      .mb-2 {
        margin-bottom: 0.5rem;
      }

      .records-tag-bar {
        width: 4px;
        height: 1.125rem;
        background-color: var(--primary, #ef4444);
        border-radius: var(--radius-pill, 9999px);
        flex-shrink: 0;
      }

      .records-tag {
        font-family: var(--font-sans);
        font-size: 0.8125rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--primary, #ef4444);
      }

      .records-title {
        font-family: var(--font-heading, 'Bebas Neue', sans-serif);
        font-size: clamp(2.25rem, 5vw, 3.25rem);
        font-weight: 400;
        letter-spacing: 0.03em;
        line-height: 1.1;
        color: var(--text-primary, #f9fafb);
        margin: 0 0 0.5rem 0;
      }

      .records-subtitle {
        font-family: var(--font-sans);
        font-size: 1.0625rem;
        line-height: 1.55;
        color: var(--text-secondary, #9ca3af);
        max-width: 760px;
        margin: 0 0 2.5rem 0;
      }

      /* Responsive Sports-Tech Grid: 1 col (mobile), 2 cols (tablet), 4 cols (desktop) */
      .records-grid {
        display: grid;
        grid-template-columns: repeat(1, minmax(0, 1fr));
        gap: 1.5rem;
      }

      @media (min-width: 640px) {
        .records-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (min-width: 1024px) {
        .records-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }

      /* Skeleton pulse loaders adhering seamlessly to light and dark theme tokens */
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        background-color: var(--background-secondary-color, #121216);
        border: 1px solid var(--border-theme-color, #1f2937);
        border-radius: var(--radius-lg, 0.5rem);
        padding: 1.5rem;
        height: 11rem;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.45;
        }
      }

      /* Interactive Milestone Card */
      .rec-card {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 1.5rem;
        border-radius: var(--radius-lg, 0.5rem);
        background-color: var(--background-secondary-color, #121216);
        border: 1px solid var(--border-theme-color, #1f2937);
        box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
        transition: transform var(--transition-normal, 250ms ease),
          border-color var(--transition-normal, 250ms ease),
          box-shadow var(--transition-normal, 250ms ease),
          background-color var(--transition-normal, 250ms ease);
        overflow: hidden;
        cursor: default;

        /* Subtle top highlight that illuminates in red accent on hover */
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, var(--primary, #ef4444), transparent);
          opacity: 0;
          transition: opacity var(--transition-normal, 250ms ease);
        }

        &:hover {
          transform: translateY(-4px);
          border-color: var(--primary, #ef4444);
          box-shadow: 0 12px 28px -6px rgba(239, 68, 68, 0.3),
            0 0 16px rgba(239, 68, 68, 0.2);

          &::before {
            opacity: 1;
          }
        }
      }

      .record-value {
        display: block;
        font-family: var(--font-heading, 'Bebas Neue', sans-serif);
        font-size: 2.75rem;
        font-weight: 400;
        line-height: 1;
        letter-spacing: 0.02em;
        color: var(--primary, #ef4444);
        margin-bottom: 0.5rem;
      }

      .record-label {
        font-family: var(--font-sans);
        font-size: 0.8125rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary, #9ca3af);
        margin-bottom: 0.875rem;
        line-height: 1.35;
        min-height: 2.2rem;
      }

      .record-holder {
        font-family: var(--font-sans);
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-primary, #f9fafb);
        margin-bottom: 0.25rem;
        line-height: 1.25;
      }

      .record-year {
        font-family: var(--font-sans);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-muted, #6b7280);
      }

      .records-empty {
        text-align: center;
        padding: 3.5rem 1.5rem;
        color: var(--text-secondary, #9ca3af);
        background-color: var(--background-secondary-color, #121216);
        border: 1px dashed var(--border-theme-color, #1f2937);
        border-radius: var(--radius-lg, 0.5rem);
        font-family: var(--font-sans);
        font-size: 1rem;
      }

      /* Light Mode overrides */
      :host-context(.light),
      :host-context([data-theme='light']) {
        .records-section {
          background-color: var(--bg-main, #f8fafc);
        }
        .animate-pulse {
          background-color: #ffffff;
          border-color: #e2e8f0;
        }
        .rec-card {
          background-color: #ffffff;
          border-color: #e2e8f0;
        }
        .records-empty {
          background-color: #ffffff;
          border-color: #e2e8f0;
        }
      }
    `,
  ],
})
export class HistoricalRecordsComponent implements AfterViewInit, OnDestroy {
  private readonly recordsService = inject(RecordsService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly recordsViewport = viewChild<ElementRef<HTMLElement>>('recordsViewport');

  readonly records = signal<HistoricalRecordDto[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly hasLoaded = signal<boolean>(false);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof IntersectionObserver !== 'undefined') {
      const element = this.recordsViewport()?.nativeElement;
      if (element) {
        this.observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting && !this.hasLoaded()) {
                this.loadRecords();
                this.observer?.disconnect();
                break;
              }
            }
          },
          {
            root: null,
            rootMargin: '100px', // Fetch slightly in advance of reaching section
            threshold: 0.05,
          },
        );
        this.observer.observe(element);
        return;
      }
    }

    // Fallback for SSR or non-IntersectionObserver environments
    if (!this.hasLoaded()) {
      this.loadRecords();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadRecords(): void {
    if (this.hasLoaded() || this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.recordsService.getHistoricalMilestones().subscribe({
      next: (data) => {
        this.records.set(data || []);
        this.isLoading.set(false);
        this.hasLoaded.set(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.hasLoaded.set(true);
      },
    });
  }
}
