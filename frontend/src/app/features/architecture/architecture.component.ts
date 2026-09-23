import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="arch-page">
      <div class="page-header">
        <h1>{{ 'ARCHITECTURE.TITLE' | translate }}</h1>
        <p class="subtitle">{{ 'ARCHITECTURE.SUBTITLE' | translate }}</p>
      </div>

      <!-- Architecture Diagram Card -->
      <div class="card diagram-card">
        <h2>{{ 'ARCHITECTURE.TOPOLOGY_TITLE' | translate }}</h2>
        <div class="diagram-flow">
          <div class="node client-node">
            <span class="icon">🌐</span>
            <strong>{{ 'ARCHITECTURE.BROWSER' | translate }}</strong>
            <span class="sub">{{ 'ARCHITECTURE.HTTPS' | translate }}</span>
          </div>

          <div class="arrow">↓</div>

          <div class="cluster gcp-cluster">
            <div class="cluster-label">{{ 'ARCHITECTURE.GCP' | translate }}</div>

            <div class="services-row">
              <div class="node service-node">
                <span class="icon">🅰️</span>
                <strong>{{ 'ARCHITECTURE.FRONTEND_NODE' | translate }}</strong>
                <span class="sub">{{ 'ARCHITECTURE.FRONTEND_DESC' | translate }}</span>
                <span class="badge">Port 8080</span>
              </div>

              <div class="node service-node">
                <span class="icon">🦁</span>
                <strong>{{ 'ARCHITECTURE.BACKEND_NODE' | translate }}</strong>
                <span class="sub">{{ 'ARCHITECTURE.BACKEND_DESC' | translate }}</span>
                <span class="badge">Port 8080</span>
              </div>
            </div>

            <div class="arrow-down">↓ (Cloud SQL Auth Proxy / Unix Socket)</div>

            <div class="node db-node">
              <span class="icon">🐘</span>
              <strong>{{ 'ARCHITECTURE.DB_NODE' | translate }}</strong>
              <span class="sub">{{ 'ARCHITECTURE.DB_DESC' | translate }}</span>
            </div>

            <div class="side-services">
              <div class="mini-node">
                <strong>{{ 'ARCHITECTURE.SECRET_MANAGER' | translate }}</strong>
                <span>{{ 'ARCHITECTURE.SECRET_DESC' | translate }}</span>
              </div>
              <div class="mini-node">
                <strong>{{ 'ARCHITECTURE.REGISTRY_BUILD' | translate }}</strong>
                <span>{{ 'ARCHITECTURE.REGISTRY_DESC' | translate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture Pillars -->
      <div class="pillars-grid">
        <div class="card pillar-card">
          <h3>{{ 'ARCHITECTURE.PILLAR1_TITLE' | translate }}</h3>
          <ul>
            <li>{{ 'ARCHITECTURE.PILLAR1_DESC1' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR1_DESC2' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR1_DESC3' | translate }}</li>
          </ul>
        </div>

        <div class="card pillar-card">
          <h3>{{ 'ARCHITECTURE.PILLAR2_TITLE' | translate }}</h3>
          <ul>
            <li>{{ 'ARCHITECTURE.PILLAR2_DESC1' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR2_DESC2' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR2_DESC3' | translate }}</li>
          </ul>
        </div>

        <div class="card pillar-card">
          <h3>{{ 'ARCHITECTURE.PILLAR3_TITLE' | translate }}</h3>
          <ul>
            <li>{{ 'ARCHITECTURE.PILLAR3_DESC1' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR3_DESC2' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR3_DESC3' | translate }}</li>
          </ul>
        </div>

        <div class="card pillar-card">
          <h3>{{ 'ARCHITECTURE.PILLAR4_TITLE' | translate }}</h3>
          <ul>
            <li>{{ 'ARCHITECTURE.PILLAR4_DESC1' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR4_DESC2' | translate }}</li>
            <li>{{ 'ARCHITECTURE.PILLAR4_DESC3' | translate }}</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .arch-page {
      padding: 2.5rem 0;
    }

    .page-header {
      text-align: center;
      max-width: 750px;
      margin: 0 auto 3rem auto;

      h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .subtitle {
        color: var(--text-secondary);
        font-size: 1.05rem;
      }
    }

    .card {
      background-color: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 2rem;
    }

    .diagram-card {
      margin-bottom: 3rem;
      h2 {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        text-align: center;
      }
    }

    .diagram-flow {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .node {
      background: var(--background-primary-color, var(--bg-main));
      border: 1px solid var(--border-theme-color, var(--border-color));
      border-radius: var(--radius-sm);
      padding: 1rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;

      .icon {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
      }

      .sub {
        font-family: var(--font-sans);
        font-size: var(--font-size-xs, 0.8rem);
        color: var(--text-secondary-color, var(--text-secondary));
        margin-top: 0.2rem;
      }

      .badge {
        font-size: var(--font-size-xs, 0.7rem);
        background: var(--primary-light, rgba(59, 130, 246, 0.2));
        color: var(--ice-blue, #60a5fa);
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-pill, 9999px);
        margin-top: 0.5rem;
      }
    }

    .client-node {
      width: 250px;
    }

    .arrow, .arrow-down {
      color: var(--primary-color, var(--primary));
      font-size: var(--font-size-sm, 0.85rem);
      font-weight: var(--font-weight-semibold, 600);
    }

    .gcp-cluster {
      border: 2px dashed rgba(66, 133, 244, 0.4);
      background: var(--background-card-color, rgba(17, 24, 39, 0.5));
      border-radius: var(--radius-md);
      padding: 2rem;
      width: 100%;
      max-width: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;

      .cluster-label {
        font-family: var(--font-display);
        font-size: var(--font-size-sm, 0.9rem);
        font-weight: var(--font-weight-bold, 700);
        color: var(--ice-blue, #60a5fa);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .services-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      width: 100%;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }
    }

    .db-node {
      width: 100%;
      max-width: 500px;
      border-color: rgba(52, 211, 153, 0.4);
    }

    .side-services {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      width: 100%;
      margin-top: 0.5rem;

      .mini-node {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--border-theme-color, var(--border-color));
        border-radius: var(--radius-sm);
        padding: 0.75rem 1rem;
        font-size: var(--font-size-xs, 0.8rem);
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        strong {
          color: var(--text-color, var(--text-primary));
        }
        span {
          color: var(--text-muted-color, var(--text-muted));
          font-size: var(--font-size-xs, 0.75rem);
        }
      }
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;

      .pillar-card {
        h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        ul {
          padding-left: 1.25rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.7;

          li {
            margin-bottom: 0.5rem;
          }

          strong {
            color: var(--text-primary);
          }
        }
      }
    }
  `],
})
export class ArchitectureComponent {}
