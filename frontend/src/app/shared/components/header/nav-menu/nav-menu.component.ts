import { Component, input, output, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionDialogComponent } from '../../subscription-dialog/subscription-dialog.component';
import { SignUpDialogComponent } from '../../sign-up-dialog/sign-up-dialog.component';
import { LoginDialogComponent } from '../../login-dialog/login-dialog.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { AuthService } from '../../../../core/services/auth.service';

import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';
import { TranslatePipe } from '@ngx-translate/core';

export interface NavItem {
  label?: string;
  labelKey?: string;
  link: string;
  external?: boolean;
}

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    AvatarComponent,
    ThemeToggleComponent,
    LanguageToggleComponent,
    TranslatePipe,
  ],
  template: `
    <nav class="desktop-nav" [attr.aria-label]="'COMMON.NAV.MAIN_NAVIGATION' | translate">
      <ul class="nav-list">
        @for (item of effectiveNavItems(); track item.link) {
          <li class="nav-item">
            @if (item.external) {
              <a [href]="item.link" target="_blank" rel="noopener" class="nav-link">
                {{ item.labelKey ? (item.labelKey | translate) : item.label }}
              </a>
            } @else {
              <a [routerLink]="item.link" routerLinkActive="active" class="nav-link">
                {{ item.labelKey ? (item.labelKey | translate) : item.label }}
              </a>
            }
          </li>
        }
      </ul>

      <div class="cta-group">
        <!-- Baseball Ball Theme Toggle -->
        <app-theme-toggle></app-theme-toggle>

        <!-- Dynamic Language Switcher (Venezuela & USA Flags) -->
        <app-language-toggle></app-language-toggle>

        <!-- 1. Not Logged In: Display "Login" and "Sign up" buttons -->
        @if (!authService.isLoggedIn()) {
          <button
            mat-button
            type="button"
            class="cta-secondary"
            (click)="onLoginClick()">
            {{ 'COMMON.NAV.LOGIN' | translate }}
          </button>

          <button
            mat-flat-button
            type="button"
            class="cta-primary-pill"
            (click)="onSignUpClick()">
            {{ 'COMMON.NAV.SIGN_UP' | translate }}
          </button>
        }

        <!-- 2. Logged In (Free Tier User or Paid Subscriber): Display Avatar with mat-menu -->
        @else {
          <app-avatar></app-avatar>
        }
      </div>
    </nav>

    <!-- Mobile Navigation Toggle -->
    <div class="mobile-nav">
      <!-- Baseball Ball Theme Toggle -->
      <app-theme-toggle></app-theme-toggle>

      <!-- Dynamic Language Switcher (Venezuela & USA Flags) -->
      <app-language-toggle></app-language-toggle>

      @if (authService.isLoggedIn()) {
        <app-avatar></app-avatar>
      }

      <button
        mat-icon-button
        [matMenuTriggerFor]="mobileMenu"
        [attr.aria-label]="'COMMON.NAV.OPEN_MENU' | translate"
        class="mobile-menu-btn">
        <mat-icon>menu</mat-icon>
      </button>

      <mat-menu #mobileMenu="matMenu" class="app-mobile-menu">
        @for (item of effectiveNavItems(); track item.link) {
          @if (item.external) {
            <a mat-menu-item [href]="item.link" target="_blank" rel="noopener">
              {{ item.labelKey ? (item.labelKey | translate) : item.label }}
            </a>
          } @else {
            <a mat-menu-item [routerLink]="item.link">
              {{ item.labelKey ? (item.labelKey | translate) : item.label }}
            </a>
          }
        }
        <mat-divider></mat-divider>

        @if (!authService.isLoggedIn()) {
          <button mat-menu-item (click)="onLoginClick()">
            <mat-icon>login</mat-icon>
            <span>{{ 'COMMON.NAV.LOGIN' | translate }}</span>
          </button>
          <button mat-menu-item (click)="onSignUpClick()">
            <mat-icon>person_add</mat-icon>
            <span>{{ 'COMMON.NAV.SIGN_UP' | translate }}</span>
          </button>
        } @else {
          <a mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>{{ 'COMMON.NAV.PROFILE' | translate }}</span>
          </a>

          @if (!authService.hasActiveSubscription() && !authService.isAdmin()) {
            <button mat-menu-item (click)="onSubscribeClick()">
              <mat-icon>star</mat-icon>
              <span>{{ 'COMMON.NAV.SUBSCRIBE' | translate }}</span>
            </button>
          }

          @if (authService.isAdmin()) {
            <a mat-menu-item routerLink="/admin">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>{{ 'COMMON.NAV.SYSTEM_MATRIX' | translate }}</span>
            </a>
          }

          <button mat-menu-item (click)="onLogoutClick()">
            <mat-icon>logout</mat-icon>
            <span>{{ 'COMMON.NAV.LOGOUT' | translate }}</span>
          </button>
        }
      </mat-menu>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    :host {
      display: flex;
      align-items: center;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 1.75rem;
    }

    .nav-link {
      color: var(--text-secondary-color, var(--text-secondary, #9ca3af));
      font-size: var(--font-size-sm, 0.95rem);
      font-weight: var(--font-weight-medium, 500);
      text-decoration: none;
      transition: color 0.15s ease;
      cursor: pointer;

      &:hover {
        color: var(--text-color, var(--text-primary, #ffffff));
      }

      &.active {
        color: var(--primary-color, var(--primary, #3b82f6));
        font-weight: var(--font-weight-semibold, 600);
      }
    }

    .cta-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Secondary CTA: Login button */
    .cta-secondary {
      font-weight: var(--font-weight-semibold, 600);
      text-transform: capitalize;
      color: var(--text-color, var(--text-primary, #f9fafb)) !important;
      border-radius: var(--radius-pill, 9999px);
      border: 1px solid var(--border-theme-color, var(--border-color)) !important;
      padding: 0 1.25rem;
      height: 2.5rem;
      &:hover {
        background-color: var(--background-hover-color, var(--bg-card-hover, rgba(255, 255, 255, 0.08)));
      }
    }

    .cta-primary-pill {
      border-radius: var(--radius-pill, 9999px) !important;
      padding: 0 1.75rem !important;
      height: 2.5rem !important;
      font-weight: var(--font-weight-semibold, 600);
      font-size: var(--font-size-sm, 0.9rem);
      text-transform: capitalize;
      letter-spacing: 0.02em;
      background-color: var(--primary-color, var(--primary, #ef4444)) !important;
      color: #ffffff !important;
      box-shadow: 0 2px 8px var(--primary-glow, rgba(239, 68, 68, 0.35));
      transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease !important;

      &:hover {
        transform: translateY(-1px);
        background-color: var(--primary-hover, #dc2626) !important;
        box-shadow: var(--shadow-glow, 0 4px 14px var(--primary-glow, rgba(239, 68, 68, 0.5)));
      }
    }

    .mobile-nav {
      display: none;
      align-items: center;
      gap: 0.75rem;

      .mobile-menu-btn {
        color: var(--text-color, var(--text-primary, #ffffff));
      }
    }

    @media (max-width: 860px) {
      .desktop-nav {
        display: none;
      }

      .mobile-nav {
        display: flex;
      }
    }
  `],
})
export class NavMenuComponent {
  readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  // Base navigation links
  readonly navItems = input<NavItem[]>([
    { label: 'About Us', labelKey: 'COMMON.NAV.ABOUT', link: '/#about' },
    { label: 'Products', labelKey: 'COMMON.NAV.PRODUCTS', link: '/#products' },
    { label: 'Service', labelKey: 'COMMON.NAV.SERVICE', link: '/#service' },
    { label: 'Architecture', labelKey: 'COMMON.NAV.ARCHITECTURE', link: '/architecture' },
  ]);

  // Dynamically compute nav items based on user role and state
  readonly effectiveNavItems = computed<NavItem[]>(() => {
    const items = [...this.navItems()];

    if (this.authService.isAdmin()) {
      items.push({ label: 'Manage Users', labelKey: 'COMMON.NAV.USERS', link: '/users' });
    } else {
      items.push({ label: 'Premium Pro', labelKey: 'COMMON.NAV.PREMIUM', link: '/premium' });
    }

    return items;
  });

  readonly subscribeClicked = output<void>();
  readonly subscribeClick = output<void>();
  readonly loginClicked = output<void>();
  readonly loginClick = output<void>();
  readonly signUpClicked = output<void>();
  readonly signUpClick = output<void>();

  onSubscribeClick(): void {
    this.dialog.open(SubscriptionDialogComponent, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'subscription-dialog-panel',
      autoFocus: false,
    });
    this.subscribeClicked.emit();
    this.subscribeClick.emit();
  }

  onSignUpClick(): void {
    this.dialog.open(SignUpDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'signup-dialog-panel',
      autoFocus: false,
    });
    this.signUpClicked.emit();
    this.signUpClick.emit();
  }

  onLoginClick(): void {
    this.dialog.open(LoginDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'login-dialog-panel',
      autoFocus: false,
    });
    this.loginClicked.emit();
    this.loginClick.emit();
  }

  onLogoutClick(): void {
    this.authService.logout();
  }
}

