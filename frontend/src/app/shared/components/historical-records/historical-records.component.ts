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
  templateUrl: './historical-records.component.html',
  styleUrl: './historical-records.component.scss',
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
