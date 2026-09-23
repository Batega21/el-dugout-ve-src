import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
} from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-guide-section',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (canView()) {
      <section class="guide-section">
        <h2>{{ 'SECTIONS.QUICKSTART_TITLE' | translate }}</h2>
        <div class="steps-grid">
          <div class="card step-card">
            <span class="step-number">01</span>
            <h4>{{ 'SECTIONS.QUICKSTART_STEP1_TITLE' | translate }}</h4>
            <p>{{ 'SECTIONS.QUICKSTART_STEP1_DESC' | translate }}</p>
            <pre><code>npm run docker:db</code></pre>
          </div>
          <div class="card step-card">
            <span class="step-number">02</span>
            <h4>{{ 'SECTIONS.QUICKSTART_STEP2_TITLE' | translate }}</h4>
            <p>{{ 'SECTIONS.QUICKSTART_STEP2_DESC' | translate }}</p>
            <pre><code>npm run dev:backend</code></pre>
          </div>
          <div class="card step-card">
            <span class="step-number">03</span>
            <h4>{{ 'SECTIONS.QUICKSTART_STEP3_TITLE' | translate }}</h4>
            <p>{{ 'SECTIONS.QUICKSTART_STEP3_DESC' | translate }}</p>
            <pre><code>npm run dev:frontend</code></pre>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .card {
      background-color: var(--background-card-color, var(--bg-card));
      border: 1px solid var(--border-theme-color, var(--border-color));
      border-radius: var(--radius-md);
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: border-color 0.2s ease, transform 0.2s ease;

      &:hover {
        border-color: var(--border-strong, var(--text-muted));
        transform: translateY(-2px);
      }
    }

    .guide-section {
      margin: 2rem 0;

      h2 {
        font-family: var(--font-display);
        font-size: var(--font-size-xl, 1.5rem);
        font-weight: var(--font-weight-bold, 700);
        color: var(--text-color, var(--text-primary));
        margin-bottom: 1.5rem;
        text-align: center;
      }

      .steps-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .step-card {
        position: relative;
        .step-number {
          font-family: var(--font-display);
          font-size: var(--font-size-xl, 1.5rem);
          font-weight: var(--font-weight-extrabold, 800);
          color: var(--ice-blue, var(--primary));
          margin-bottom: 0.5rem;
          display: block;
        }

        h4 {
          font-family: var(--font-sans);
          font-weight: var(--font-weight-semibold, 600);
          font-size: var(--font-size-md, 1.1rem);
          color: var(--text-color, var(--text-primary));
          margin-bottom: 0.5rem;
        }

        p {
          font-family: var(--font-sans);
          color: var(--text-secondary-color, var(--text-secondary));
          font-size: var(--font-size-sm, 0.875rem);
          margin-bottom: 1rem;
        }

        pre {
          background-color: var(--background-primary-color, var(--bg-main));
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-mono);
          font-size: var(--font-size-xs, 0.8rem);
          color: var(--ice-blue, #38bdf8);
          overflow-x: auto;
        }
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideSectionComponent {
  private readonly authService = inject(AuthService);

  /**
   * Optional override for testing or manual visibility control.
   */
  readonly forceVisible = input<boolean | null>(null, { alias: 'force-visible' });

  /**
   * Only visible for users with admin accounts/access.
   */
  readonly canView = computed(() => {
    const forced = this.forceVisible();
    if (forced !== null) {
      return forced;
    }
    return this.authService.isAdmin();
  });
}
