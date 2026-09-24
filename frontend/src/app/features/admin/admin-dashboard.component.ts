import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SectionCardsComponent } from '../../shared/components/section-cards/section-cards.component';

interface AdminMetrics {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  system: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
    nodeVersion: string;
    platform: string;
  };
  businessTelemetry: {
    totalUsers: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    subscriptionsByTier: Record<string, number>;
  };
}

interface SubscriptionRecord {
  id: string;
  plan: string;
  billingPeriod: string;
  status: string;
  createdAt: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    mobileNumber?: string;
  } | null;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, SectionCardsComponent, TranslatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly metrics = signal<AdminMetrics | null>(null);
  readonly subscriptions = signal<SubscriptionRecord[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    // Fetch metrics
    this.http.get<AdminMetrics>('health/metrics').subscribe({
      next: (m) => this.metrics.set(m),
      error: (err) => console.warn('Failed to load metrics:', err),
    });

    // Fetch subscriptions
    this.http.get<SubscriptionRecord[]>('subscriptions').subscribe({
      next: (subs) => {
        this.subscriptions.set(subs);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Access denied or unable to load subscriptions.',
        );
      },
    });
  }
}
