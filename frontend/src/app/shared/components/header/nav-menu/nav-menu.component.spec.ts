// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NavMenuComponent } from './nav-menu.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('NavMenuComponent', () => {
  let component: NavMenuComponent;
  let injector: Injector;

  let mockAuthService: {
    isLoggedIn: ReturnType<typeof signal<boolean>>;
    isAdmin: ReturnType<typeof signal<boolean>>;
    hasActiveSubscription: ReturnType<typeof signal<boolean>>;
    logout: any;
  };

  let mockDialog: {
    open: any;
  };

  beforeEach(() => {
    mockAuthService = {
      isLoggedIn: signal(false),
      isAdmin: signal(false),
      hasActiveSubscription: signal(false),
      logout: vi.fn(),
    };

    mockDialog = {
      open: vi.fn(),
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    });

    component = runInInjectionContext(injector, () => new NavMenuComponent());
  });

  it('should create the nav menu component', () => {
    expect(component).toBeTruthy();
  });

  it('should include Premium Pro item for non-admin user', () => {
    const items = component.effectiveNavItems();
    const premiumItem = items.find((i) => i.link === '/premium');
    expect(premiumItem).toBeDefined();
    expect(premiumItem?.labelKey).toBe('COMMON.NAV.PREMIUM');
  });

  it('should include Admin item when user is admin', () => {
    mockAuthService.isAdmin.set(true);
    const items = component.effectiveNavItems();
    const adminItem = items.find((i) => i.link === '/admin');
    expect(adminItem).toBeDefined();
    expect(adminItem?.labelKey).toBe('COMMON.NAV.ADMIN');
  });

  it('should open login dialog on onLoginClick', () => {
    component.onLoginClick();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open sign up dialog on onSignUpClick', () => {
    component.onSignUpClick();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open subscription dialog on onSubscribeClick', () => {
    component.onSubscribeClick();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should call authService.logout on onLogoutClick', () => {
    component.onLogoutClick();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
