import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../../core/services/auth.service';
import { SubscriptionDialogComponent } from '../../subscription-dialog/subscription-dialog.component';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [RouterLink, MatMenuModule, MatButtonModule, MatIconModule, MatDividerModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="avatar-container">
      <button
        type="button"
        [matMenuTriggerFor]="avatarMenu"
        class="avatar-trigger-btn"
        [attr.aria-label]="userAriaLabel()"
        [title]="authService.currentUser()?.email || ('COMMON.TIERS.USER' | translate)">
        <div class="avatar-circle">
          @if (avatarUrl()) {
            <img
              [src]="avatarUrl()"
              alt="User avatar"
              class="avatar-img"
              (error)="onImgError()"
            />
          } @else {
            <mat-icon class="fallback-icon">person</mat-icon>
          }
        </div>

        @if (authService.currentTier() !== 'FREE') {
          <span class="tier-pill">{{ authService.currentTier() }}</span>
        }
      </button>

      <mat-menu #avatarMenu="matMenu" class="avatar-mat-menu" xPosition="before">
        <div class="menu-header" (click)="$event.stopPropagation()">
          <span class="user-display-name">{{ userName() }}</span>
          <span class="user-email-text">{{ authService.currentUser()?.email }}</span>
          <span class="user-tier-tag" [class.paid]="authService.hasActiveSubscription()">
            {{ tierTagLabel() | translate }}
          </span>
        </div>

        <mat-divider></mat-divider>

        <!-- Profile option -->
        <a mat-menu-item routerLink="/profile" class="avatar-menu-item">
          <mat-icon class="menu-icon">person</mat-icon>
          <span>{{ 'COMMON.NAV.PROFILE' | translate }}</span>
        </a>

        <!-- Subscribe option (Only for Free Tier User without paid plan) -->
        @if (!authService.hasActiveSubscription() && !authService.isAdmin()) {
          <button mat-menu-item (click)="onSubscribeClick()" class="avatar-menu-item subscribe-option">
            <mat-icon class="menu-icon gold">star</mat-icon>
            <span>{{ 'COMMON.NAV.SUBSCRIBE' | translate }}</span>
          </button>
        }

        <!-- Admin System Matrix option -->
        @if (authService.isAdmin()) {
          <a mat-menu-item routerLink="/admin" class="avatar-menu-item">
            <mat-icon class="menu-icon">admin_panel_settings</mat-icon>
            <span>{{ 'COMMON.NAV.SYSTEM_MATRIX' | translate }}</span>
          </a>
        }

        <mat-divider></mat-divider>

        <!-- Logout option -->
        <button mat-menu-item (click)="onLogoutClick()" class="avatar-menu-item logout-option">
          <mat-icon class="menu-icon">logout</mat-icon>
          <span>{{ 'COMMON.NAV.LOGOUT' | translate }}</span>
        </button>
      </mat-menu>
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
    }

    .avatar-trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: none;
      padding: 0.25rem;
      border-radius: 9999px;
      cursor: pointer;
      transition: opacity 0.15s ease;
      color: inherit;

      &:hover {
        opacity: 0.85;
      }
    }

    .avatar-circle {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--mat-sys-surface-container-high, var(--background-hover-color, #1f2937));
      border: 2px solid var(--primary-color, var(--primary, #3b82f6));
      color: var(--text-color, var(--text-primary, #f9fafb));
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.2));
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .fallback-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .tier-pill {
      font-size: var(--font-size-xs, 0.65rem);
      font-weight: var(--font-weight-bold, 700);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-pill, 9999px);
      background: var(--primary-color, var(--primary, #3b82f6));
      color: #ffffff;
    }

    .menu-header {
      padding: 0.75rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 200px;
    }

    .user-display-name {
      font-family: var(--font-display);
      font-weight: var(--font-weight-bold, 700);
      font-size: var(--font-size-sm, 0.95rem);
      color: var(--text-color, var(--text-primary, #f9fafb));
    }

    .user-email-text {
      font-size: var(--font-size-xs, 0.8rem);
      color: var(--text-secondary-color, var(--text-secondary, #9ca3af));
    }

    .user-tier-tag {
      display: inline-block;
      align-self: flex-start;
      margin-top: 0.35rem;
      font-size: var(--font-size-xs, 0.7rem);
      font-weight: var(--font-weight-semibold, 600);
      text-transform: uppercase;
      padding: 0.15rem 0.5rem;
      border-radius: var(--radius-xs, 4px);
      background: var(--background-card-color, #111827);
      color: var(--text-muted-color, #9ca3af);
      border: 1px solid var(--border-theme-color, #1f293d);

      &.paid {
        background: var(--primary-light, rgba(59, 130, 246, 0.15));
        color: var(--ice-blue, #38bdf8);
        border-color: var(--primary-color, #3b82f6);
      }
    }

    .avatar-menu-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .menu-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;

        &.gold {
          color: #f59e0b;
        }
      }
    }
  `],
})
export class AvatarComponent {
  readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  private readonly imgLoadFailed = signal<boolean>(false);

  readonly avatarUrl = computed(() => {
    if (this.imgLoadFailed()) return null;
    const raw = this.authService.currentUser()?.avatarUrl;
    return raw && raw.trim().length > 0 ? raw.trim() : null;
  });

  readonly userName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'User';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName.length > 0 ? fullName : user.email.split('@')[0];
  });

  readonly tierTagLabel = computed(() => {
    if (this.authService.isAdmin()) return 'Admin';
    if (this.authService.hasActiveSubscription()) {
      return `${this.authService.currentTier()} Subscriber`;
    }
    return 'Free Tier User';
  });

  readonly userAriaLabel = computed(() => {
    return `${this.userName()} account menu`;
  });

  protected onImgError(): void {
    this.imgLoadFailed.set(true);
  }

  protected onSubscribeClick(): void {
    this.dialog.open(SubscriptionDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      panelClass: 'app-dialog-panel',
    });
  }

  protected onLogoutClick(): void {
    this.authService.logout();
  }
}
