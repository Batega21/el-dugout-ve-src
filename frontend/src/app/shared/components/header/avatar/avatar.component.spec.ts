import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AvatarComponent } from './avatar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { SubscriptionTier } from '../../../../core/models/subscription.model';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let injector: Injector;

  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
    isAdmin: () => boolean;
    isLoggedIn: () => boolean;
    currentTier: () => SubscriptionTier;
    hasActiveSubscription: () => boolean;
    logout: any;
  };

  let mockDialog: {
    open: any;
  };

  beforeEach(() => {
    const userSignal = signal<User | null>({
      id: 'user-1',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
      mobileNumber: '+123456789',
      avatarUrl: null,
      role: 'USER',
      tier: 'FREE',
      twoFactorEnabled: false,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    mockAuthService = {
      currentUser: userSignal,
      isAdmin: () => userSignal()?.role === 'ADMIN',
      isLoggedIn: () => !!userSignal(),
      currentTier: () => userSignal()?.tier || 'FREE',
      hasActiveSubscription: () => userSignal()?.tier === 'BASIC' || userSignal()?.tier === 'PREMIUM',
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

    component = runInInjectionContext(injector, () => new AvatarComponent());
  });

  it('should create the avatar component', () => {
    expect(component).toBeTruthy();
  });

  it('should compute full user name when firstName and lastName are present', () => {
    expect(component.userName()).toBe('Alex Smith');
  });

  it('should fall back to email prefix if name is empty', () => {
    mockAuthService.currentUser.set({
      id: 'user-2',
      email: 'developer@example.com',
      firstName: '',
      lastName: '',
      role: 'USER',
      tier: 'FREE',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });
    expect(component.userName()).toBe('developer');
  });

  it('should return null for avatarUrl when user has no avatar', () => {
    expect(component.avatarUrl()).toBeNull();
  });

  it('should return valid avatarUrl when present on user', () => {
    mockAuthService.currentUser.set({
      id: 'user-1',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
      avatarUrl: 'https://images.example.com/avatar.jpg',
      role: 'USER',
      tier: 'FREE',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });
    expect(component.avatarUrl()).toBe('https://images.example.com/avatar.jpg');
  });

  it('should fall back to null avatarUrl on image load error', () => {
    mockAuthService.currentUser.set({
      id: 'user-1',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
      avatarUrl: 'https://broken-image.com/notfound.png',
      role: 'USER',
      tier: 'FREE',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });
    expect(component.avatarUrl()).toBe('https://broken-image.com/notfound.png');

    (component as any).onImgError();
    expect(component.avatarUrl()).toBeNull();
  });

  it('should label Free Tier User correctly in tierTagLabel', () => {
    expect(component.tierTagLabel()).toBe('Free Tier User');
  });

  it('should label Paid Subscriber correctly in tierTagLabel', () => {
    mockAuthService.currentUser.set({
      id: 'user-1',
      email: 'alex@example.com',
      firstName: 'Alex',
      lastName: 'Smith',
      role: 'USER',
      tier: 'PREMIUM',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });
    expect(component.tierTagLabel()).toBe('PREMIUM Subscriber');
  });

  it('should call authService.logout on onLogoutClick', () => {
    (component as any).onLogoutClick();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should open subscription dialog on onSubscribeClick', () => {
    (component as any).onSubscribeClick();
    expect(mockDialog.open).toHaveBeenCalled();
  });
});
