import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LogoComponent } from './logo/logo.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, LogoComponent, NavMenuComponent],
  template: `
    <header class="app-header">
      <mat-toolbar class="header-toolbar">
        <div class="header-container">
          <!-- 1.1 Logo Component -->
          <app-logo></app-logo>

          <!-- 1.2 Navigation Menu Component -->
          <app-nav-menu></app-nav-menu>
        </div>
      </mat-toolbar>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .app-header {
      width: 100%;
    }

    .header-toolbar {
      background-color: var(--background-overlay, rgba(11, 15, 25, 0.82)) !important;
      backdrop-filter: blur(var(--backdrop-blur, 12px));
      -webkit-backdrop-filter: blur(var(--backdrop-blur, 12px));
      border-bottom: 1px solid var(--border-subtle);
      height: var(--header-height, 4.5rem) !important;
      padding: 0 !important;
      color: var(--text-color, var(--text-primary));
      box-shadow: var(--shadow-md);
      transition: background-color var(--transition-normal, 250ms ease), border-color var(--transition-normal, 250ms ease), color var(--transition-normal, 250ms ease);
    }

    .header-container {
      width: 100%;
      max-width: var(--wrap-max-width, 1200px);
      margin: 0 auto;
      padding: 0 var(--wrap-padding-x, 1.5rem);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `],
})
export class HeaderComponent {}
