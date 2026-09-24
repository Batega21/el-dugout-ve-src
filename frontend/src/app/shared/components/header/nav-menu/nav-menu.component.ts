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
  templateUrl: './nav-menu.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './nav-menu.component.scss',
})
export class NavMenuComponent {
  readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  // Base navigation links
  readonly navItems = input<NavItem[]>([
    { label: 'About Us', labelKey: 'COMMON.NAV.ABOUT', link: '/#about' },
    { label: 'Products', labelKey: 'COMMON.NAV.PRODUCTS', link: '/#products' },
    { label: 'Service', labelKey: 'COMMON.NAV.SERVICE', link: '/#service' },
  ]);

  // Dynamically compute nav items based on user role and state
  readonly effectiveNavItems = computed<NavItem[]>(() => {
    const items = [...this.navItems()];

    if (this.authService.isAdmin()) {
      items.push({ label: 'Admin', labelKey: 'COMMON.NAV.ADMIN', link: '/admin' });
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

