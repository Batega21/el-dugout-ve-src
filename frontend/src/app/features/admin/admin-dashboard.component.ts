import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

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
  imports: [CommonModule, RouterLink, StatusBadgeComponent, TranslatePipe],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <div>
          <span class="admin-badge">{{ 'ADMIN.WORKSPACE_BADGE' | translate }}</span>
          <h1>{{ 'ADMIN.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'ADMIN.SUBTITLE' | translate }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/imports" class="btn btn-outline">{{ 'ADMIN.INGEST_LEADERBOARDS' | translate }}</a>
          <a routerLink="/users" class="btn btn-outline">{{ 'ADMIN.MANAGE_USERS' | translate }}</a>
          <button (click)="loadAll()" class="btn btn-primary" [disabled]="loading()">
            {{ (loading() ? 'ADMIN.REFRESHING' : 'ADMIN.REFRESH_METRICS') | translate }}
          </button>
        </div>
      </div>

      <!-- Error message -->
      @if (errorMessage()) {
        <div class="alert alert-danger">{{ errorMessage() }}</div>
      }

      <!-- System Health Matrix Section -->
      <section class="metrics-grid">
        <div class="metric-card">
          <span class="metric-label">{{ 'ADMIN.SYSTEM_STATUS' | translate }}</span>
          <div class="metric-value status-active">
            <span class="status-dot"></span>
            {{ metrics()?.status || 'ONLINE' | uppercase }}
          </div>
          <span class="metric-detail">{{ 'ADMIN.UPTIME' | translate }}: {{ metrics()?.uptimeSeconds || 0 }}s</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">{{ 'ADMIN.HEAP_USED' | translate }}</span>
          <div class="metric-value">{{ metrics()?.system?.heapUsedMb || 0 }} MB</div>
          <span class="metric-detail">{{ 'ADMIN.TOTAL' | translate }}: {{ metrics()?.system?.heapTotalMb || 0 }} MB (RSS: {{ metrics()?.system?.rssMb || 0 }} MB)</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">{{ 'ADMIN.TOTAL_USERS' | translate }}</span>
          <div class="metric-value">{{ metrics()?.businessTelemetry?.totalUsers || 0 }}</div>
          <span class="metric-detail">{{ 'ADMIN.SYSTEM_ACCOUNTS' | translate }}</span>
        </div>

        <div class="metric-card">
          <span class="metric-label">{{ 'ADMIN.ACTIVE_SUBSCRIPTIONS' | translate }}</span>
          <div class="metric-value highlight">{{ metrics()?.businessTelemetry?.activeSubscriptions || 0 }}</div>
          <span class="metric-detail">
            {{ 'ADMIN.BASIC' | translate }}: {{ metrics()?.businessTelemetry?.subscriptionsByTier?.['BASIC'] || 0 }} | 
            {{ 'ADMIN.PREMIUM' | translate }}: {{ metrics()?.businessTelemetry?.subscriptionsByTier?.['PREMIUM'] || 0 }}
          </span>
        </div>
      </section>

      <!-- Subscriptions Management Table -->
      <section class="table-card">
        <div class="card-header">
          <h2>{{ 'ADMIN.TABLE_TITLE' | translate }} ({{ subscriptions().length }})</h2>
          <span class="card-hint">{{ 'ADMIN.TABLE_HINT' | translate }}</span>
        </div>

        @if (loading() && subscriptions().length === 0) {
          <div class="empty-state">{{ 'ADMIN.LOADING_SUBS' | translate }}</div>
        }

        @if (!loading() && subscriptions().length === 0) {
          <div class="empty-state">{{ 'ADMIN.NO_SUBS' | translate }}</div>
        }

        @if (subscriptions().length > 0) {
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ 'ADMIN.COL_SUBSCRIBER' | translate }}</th>
                  <th>{{ 'ADMIN.COL_TIER' | translate }}</th>
                  <th>{{ 'ADMIN.COL_BILLING' | translate }}</th>
                  <th>{{ 'ADMIN.COL_STATUS' | translate }}</th>
                  <th>{{ 'ADMIN.COL_LINKED' | translate }}</th>
                  <th>{{ 'ADMIN.COL_CREATED' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (sub of subscriptions(); track sub.id) {
                  <tr>
                    <td>
                      <div class="subscriber-info">
                        <span class="sub-name">{{ sub.user ? (sub.user.firstName + ' ' + sub.user.lastName) : ('ADMIN.COL_SUBSCRIBER' | translate) }}</span>
                        <span class="sub-email">{{ sub.user?.email || ('ADMIN.NO_EMAIL' | translate) }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="tier-pill" [class.premium]="sub.plan === 'PREMIUM'" [class.basic]="sub.plan === 'BASIC'">
                        {{ sub.plan }}
                      </span>
                    </td>
                    <td>{{ sub.billingPeriod }}</td>
                    <td>
                      <app-status-badge
                        [text]="sub.status"
                        [type]="sub.status === 'ACTIVE' || sub.status === 'TRIALING' ? 'success' : 'warning'">
                      </app-status-badge>
                    </td>
                    <td>
                      @if (sub.user) {
                        <span class="linked-user-tag">✓ {{ sub.user.email }}</span>
                      } @else {
                        <span class="unlinked-tag">{{ 'ADMIN.UNLINKED' | translate }}</span>
                      }
                    </td>
                    <td>{{ sub.createdAt | date:'shortDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2.5rem 0;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;

      .admin-badge {
        display: inline-block;
        font-size: var(--font-size-xs, 0.75rem);
        font-weight: var(--font-weight-bold, 700);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--warning, #fbbf24);
        background: rgba(245, 158, 11, 0.15);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-pill, 9999px);
        margin-bottom: 0.5rem;
      }

      h1 {
        font-family: var(--font-display);
        font-size: var(--font-size-2xl, 2rem);
        font-weight: var(--font-weight-extrabold, 800);
        color: var(--text-color, #ffffff);
        margin: 0 0 0.25rem 0;
      }

      .subtitle {
        font-family: var(--font-sans);
        color: var(--text-secondary-color, var(--text-secondary, #9ca3af));
        font-size: var(--font-size-sm, 0.95rem);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn {
      padding: 0.6rem 1.25rem;
      border-radius: var(--radius-pill, 9999px);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-semibold, 600);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &.btn-primary {
        background: var(--primary-color, #3b82f6);
        color: #ffffff;
        border: none;
        &:hover:not(:disabled) {
          background: var(--primary-hover, #2563eb);
        }
      }

      &.btn-outline {
        border: 1px solid var(--border-strong, rgba(255, 255, 255, 0.2));
        color: var(--text-color, #ffffff);
        background: transparent;
        &:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: var(--background-card-color, var(--bg-card, #111827));
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-lg, 1rem);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;

      .metric-label {
        font-size: var(--font-size-xs, 0.8rem);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted-color, #9ca3af);
        margin-bottom: 0.5rem;
      }

      .metric-value {
        font-family: var(--font-display);
        font-size: var(--font-size-2xl, 1.85rem);
        font-weight: var(--font-weight-extrabold, 800);
        color: var(--text-color, #ffffff);
        margin-bottom: 0.5rem;

        &.status-active {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--success, #34d399);
        }

        &.highlight {
          color: var(--ice-blue, #60a5fa);
        }
      }

      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--success, #34d399);
        box-shadow: 0 0 8px var(--success, #34d399);
      }

      .metric-detail {
        font-size: var(--font-size-xs, 0.8rem);
        color: var(--text-muted-color, #6b7280);
      }
    }

    .table-card {
      background: var(--background-card-color, var(--bg-card, #111827));
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-lg, 1rem);
      padding: 1.5rem;

      .card-header {
        margin-bottom: 1.25rem;
        h2 {
          font-family: var(--font-display);
          font-size: var(--font-size-lg, 1.25rem);
          font-weight: var(--font-weight-bold, 700);
          color: var(--text-color, #ffffff);
          margin: 0 0 0.25rem 0;
        }
        .card-hint {
          font-size: var(--font-size-xs, 0.8rem);
          color: var(--text-muted-color, #9ca3af);
        }
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: var(--font-size-sm, 0.875rem);

      th {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
        color: var(--text-muted-color, #9ca3af);
        font-weight: var(--font-weight-semibold, 600);
      }

      td {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
        color: var(--text-secondary-color, #e5e7eb);
      }

      tr:last-child td {
        border-bottom: none;
      }

      .subscriber-info {
        display: flex;
        flex-direction: column;
        .sub-name {
          font-weight: var(--font-weight-semibold, 600);
          color: var(--text-color, #ffffff);
        }
        .sub-email {
          font-size: var(--font-size-xs, 0.8rem);
          color: var(--text-muted-color, #9ca3af);
        }
      }

      .tier-pill {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius-pill, 9999px);
        font-size: var(--font-size-xs, 0.75rem);
        font-weight: 700;
        background: rgba(107, 114, 128, 0.2);
        color: #d1d5db;

        &.basic {
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        }

        &.premium {
          background: rgba(168, 85, 247, 0.2);
          color: #d8b4fe;
        }
      }

      .linked-user-tag {
        font-size: 0.8rem;
        color: #34d399;
      }

      .unlinked-tag {
        font-size: 0.8rem;
        color: #6b7280;
      }
    }

    .alert-danger {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.85rem 1.25rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .empty-state {
      padding: 3rem 1rem;
      text-align: center;
      color: #9ca3af;
      font-size: 0.9rem;
    }
  `],
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
