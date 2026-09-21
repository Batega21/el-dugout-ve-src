import { Component, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'app-architecture',
  standalone: true,
  imports: [],
  template: `
    <div class="arch-page">
      <div class="page-header">
        <h1>Cloud & System Architecture</h1>
        <p class="subtitle">Designed for enterprise scalability, security, and velocity on Google Cloud Platform.</p>
      </div>

      <!-- Architecture Diagram Card -->
      <div class="card diagram-card">
        <h2>Deployment Topology (Google Cloud Platform)</h2>
        <div class="diagram-flow">
          <div class="node client-node">
            <span class="icon">🌐</span>
            <strong>Web Browser</strong>
            <span class="sub">HTTPS Traffic</span>
          </div>

          <div class="arrow">↓</div>

          <div class="cluster gcp-cluster">
            <div class="cluster-label">Google Cloud Platform (GCP)</div>

            <div class="services-row">
              <div class="node service-node">
                <span class="icon">🅰️</span>
                <strong>Frontend: Cloud Run</strong>
                <span class="sub">Angular 19 + Nginx SPA Container</span>
                <span class="badge">Port 8080</span>
              </div>

              <div class="node service-node">
                <span class="icon">🦁</span>
                <strong>Backend: Cloud Run</strong>
                <span class="sub">NestJS REST API Container</span>
                <span class="badge">Port 8080</span>
              </div>
            </div>

            <div class="arrow-down">↓ (Cloud SQL Auth Proxy / Unix Socket)</div>

            <div class="node db-node">
              <span class="icon">🐘</span>
              <strong>Google Cloud SQL (PostgreSQL 16)</strong>
              <span class="sub">Managed automated backups, high availability, point-in-time recovery</span>
            </div>

            <div class="side-services">
              <div class="mini-node">
                <strong>GCP Secret Manager</strong>
                <span>Secure injection of DATABASE_URL & JWT_SECRET</span>
              </div>
              <div class="mini-node">
                <strong>Artifact Registry & Cloud Build</strong>
                <span>Automated container builds, migrations & deployment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Architecture Pillars -->
      <div class="pillars-grid">
        <div class="card pillar-card">
          <h3>1. Clean Frontend Architecture</h3>
          <ul>
            <li><strong>Standalone Components:</strong> Zero NgModules, lean bundle sizes, and tree-shaking.</li>
            <li><strong>Angular Signals:</strong> Fine-grained reactivity without over-triggering change detection.</li>
            <li><strong>Hardened Nginx:</strong> Multi-stage Docker build serving static assets with gzip, SPA fallback, and security headers.</li>
          </ul>
        </div>

        <div class="card pillar-card">
          <h3>2. Robust Backend Foundation</h3>
          <ul>
            <li><strong>NestJS Clean Architecture:</strong> Controllers, Services, DTOs, and global exception filters.</li>
            <li><strong>Class Validation:</strong> Strict payload validation with <code>class-validator</code>.</li>
            <li><strong>OpenAPI / Swagger:</strong> Built-in interactive documentation at <code>/api/docs</code>.</li>
          </ul>
        </div>

        <div class="card pillar-card">
          <h3>3. Cloud SQL & Prisma ORM</h3>
          <ul>
            <li><strong>Type-safe ORM:</strong> Prisma schema with automatic migrations and client generation.</li>
            <li><strong>Cloud SQL Connector:</strong> Native Unix socket connection (<code>/cloudsql/INSTANCE_CONNECTION_NAME</code>) avoiding public IP exposure.</li>
            <li><strong>Zero Downtime Migrations:</strong> <code>prisma migrate deploy</code> runs via Cloud Build before traffic switch.</li>
          </ul>
        </div>

        <div class="card pillar-card">
          <h3>4. Google Cloud Run Optimization</h3>
          <ul>
            <li><strong>Serverless Scale-to-Zero:</strong> Pay only for requests, handling traffic spikes seamlessly.</li>
            <li><strong>Terminus Health Probes:</strong> Native liveness and readiness probes checking database ping.</li>
            <li><strong>Least Privilege IAM:</strong> Service account with Cloud SQL Client and Secret Accessor roles only.</li>
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
