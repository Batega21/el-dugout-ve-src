import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-premium-feature',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="premium-feature-page">
      <div class="page-header">
        <span class="premium-badge">★ Premium Entitlement</span>
        <h1>Executive Telemetry & Pro Analytics</h1>
        <p class="subtitle">Exclusive features available to Premium Subscribers and System Administrators.</p>
      </div>

      <div class="feature-card">
        <h2>Enterprise Deep Analytics Engine</h2>
        <p class="desc">
          This view is gated behind the <strong>SubscriptionGuard</strong> with
          <code>requiredTier: 'PREMIUM'</code>. System administrators bypass this verification automatically,
          while standard users require an active Premium plan.
        </p>

        @if (featureData()) {
          <div class="feature-output">
            <div class="output-item">
              <span class="label">Feature Level:</span>
              <span class="val highlight">{{ featureData().tier }}</span>
            </div>
            <div class="output-item">
              <span class="label">Feature Capability:</span>
              <span class="val">{{ featureData().featureName }}</span>
            </div>
            <div class="output-item">
              <span class="label">Entitlement Status:</span>
              <span class="val status-ok">Verified Active ✓</span>
            </div>
          </div>
        } @else if (loading()) {
          <p class="loading-text">Verifying backend cryptographic entitlement...</p>
        } @else if (errorMessage()) {
          <div class="alert alert-danger">{{ errorMessage() }}</div>
        }

        <div class="action-row">
          <a routerLink="/" class="btn btn-outline">Back to Home</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .premium-feature-page {
      padding: 3rem 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2.5rem;

      .premium-badge {
        display: inline-block;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #d8b4fe;
        background: rgba(168, 85, 247, 0.15);
        border: 1px solid rgba(168, 85, 247, 0.3);
        padding: 0.3rem 0.8rem;
        border-radius: 9999px;
        margin-bottom: 0.75rem;
      }

      h1 {
        font-size: 2.25rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 0.5rem 0;
      }

      .subtitle {
        color: #9ca3af;
        font-size: 1.05rem;
        margin: 0;
      }
    }

    .feature-card {
      background: var(--background-card-color, var(--bg-card, #111827));
      border: 1px solid rgba(168, 85, 247, 0.25);
      border-radius: var(--radius-lg, 1.25rem);
      padding: 2.5rem;
      box-shadow: var(--shadow-card, 0 10px 30px -5px rgba(0, 0, 0, 0.4));

      h2 {
        font-family: var(--font-display);
        font-size: var(--font-size-xl, 1.5rem);
        font-weight: var(--font-weight-bold, 700);
        color: var(--text-color, #ffffff);
        margin-top: 0;
      }

      .desc {
        font-family: var(--font-sans);
        color: var(--text-secondary-color, #d1d5db);
        line-height: var(--line-height-relaxed, 1.6);
        margin-bottom: 2rem;
      }
    }

    .feature-output {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
      border-radius: var(--radius-md, 0.75rem);
      padding: 1.5rem;
      margin-bottom: 2rem;

      .output-item {
        display: flex;
        justify-content: space-between;
        padding: 0.6rem 0;
        border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: var(--text-muted-color, #9ca3af);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-weight-medium, 500);
        }

        .val {
          color: var(--text-color, #ffffff);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-weight-semibold, 600);

          &.highlight {
            color: var(--ice-blue, #c084fc);
          }

          &.status-ok {
            color: var(--success, #34d399);
          }
        }
      }
    }

    .btn {
      padding: 0.7rem 1.5rem;
      border-radius: var(--radius-pill, 9999px);
      font-size: var(--font-size-sm, 0.875rem);
      font-weight: var(--font-weight-semibold, 600);
      cursor: pointer;
      text-decoration: none;
      display: inline-block;

      &.btn-outline {
        border: 1px solid var(--border-strong, rgba(255, 255, 255, 0.2));
        color: var(--text-color, #ffffff);
        &:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PremiumFeatureComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly featureData = signal<any>(null);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.http.get('features/premium').subscribe({
      next: (data) => {
        this.featureData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Access Denied: Insufficient Tier');
      },
    });
  }
}
