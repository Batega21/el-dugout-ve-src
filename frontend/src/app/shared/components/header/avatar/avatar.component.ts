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
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
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
