import { Component } from '@angular/core';

import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="container nav-content">
        <a routerLink="/" class="logo">
          <span class="logo-mark">⚾</span>
          <span class="logo-text">El Dugout Ve</span>
        </a>

        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/users" routerLinkActive="active">Users</a>
          <a routerLink="/architecture" routerLinkActive="active">Architecture</a>
          <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener" class="external-link">
            API Docs ↗
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background-color: var(--background-overlay, rgba(17, 24, 39, 0.85));
      backdrop-filter: blur(var(--backdrop-blur, 8px));
      border-bottom: 1px solid var(--border-theme-color, var(--border-color));
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .nav-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 4rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-family: var(--font-display);
      font-size: var(--font-size-md, 1.15rem);
      font-weight: var(--font-weight-bold, 700);
      color: var(--text-color, var(--text-primary));
      text-decoration: none;

      .logo-mark {
        font-size: 1.25rem;
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;

      a {
        color: var(--text-secondary-color, var(--text-secondary));
        font-size: var(--font-size-sm, 0.9rem);
        font-weight: var(--font-weight-medium, 500);
        transition: color 0.15s ease;

        &:hover, &.active {
          color: var(--text-color, var(--text-primary));
        }

        &.active {
          color: var(--primary-color, var(--primary));
        }

        &.external-link {
          color: var(--text-muted-color, var(--text-muted));
          &:hover {
            color: var(--text-color, var(--text-primary));
          }
        }
      }
    }
  `],
})
export class NavbarComponent {}
