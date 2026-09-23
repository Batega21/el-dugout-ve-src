import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <a routerLink="/" class="logo-link" aria-label="Home">
      <div class="logo-mark">
        <mat-icon class="logo-icon">layers</mat-icon>
      </div>
      <div class="logo-details">
        <span class="logo-title">{{ title() }}</span>
        @if (subtitle()) {
          <span class="logo-subtitle">{{ subtitle() }}</span>
        }
      </div>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    :host {
      display: inline-block;
    }

    .logo-link {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.9;
      }
    }

    .logo-mark {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-sm, 8px);
      background: linear-gradient(135deg, var(--primary-color, #ef4444) 0%, var(--primary-hover, #b91c1c) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px var(--primary-glow, rgba(239, 68, 68, 0.35));

      .logo-icon {
        font-size: 1.35rem;
        width: 1.35rem;
        height: 1.35rem;
        color: #ffffff;
      }
    }

    .logo-details {
      display: flex;
      flex-direction: column;
      line-height: var(--line-height-tight, 1.2);
    }

    .logo-title {
      font-family: var(--font-display);
      font-size: var(--font-size-md, 1.05rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--text-color, var(--text-primary, #f9fafb));
      letter-spacing: -0.02em;
    }

    .logo-subtitle {
      font-size: var(--font-size-xs, 0.7rem);
      font-weight: var(--font-weight-medium, 500);
      color: var(--text-muted-color, var(--text-muted, #9ca3af));
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
  `],
})
export class LogoComponent {
  readonly title = input<string>('El Dugout Ve');
  readonly subtitle = input<string>('La Biblia del Béisbol Venezolano');
}
