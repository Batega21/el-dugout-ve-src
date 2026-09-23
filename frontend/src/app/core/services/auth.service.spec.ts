import '@angular/compiler';
import { Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

describe('AuthService Signals & State', () => {
  let service: AuthService;
  let mockHttpClient: {
    post: any;
    patch: any;
  };

  beforeEach(() => {
    mockHttpClient = {
      post: vi.fn(),
      patch: vi.fn(),
    };

    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    const injector = Injector.create({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });

    service = injector.get(AuthService);
  });

  afterEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('should initialize with no user logged in by default', () => {
    service.logout();
    expect(service.currentUser()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.currentTier()).toBe('FREE');
    expect(service.hasActiveSubscription()).toBe(false);
  });

  it('should compute isAdmin as true when user has role ADMIN and tier as FREE', () => {
    const adminUser: User = {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin',
      role: 'ADMIN',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    service.setMockUser(adminUser, 'admin-token');

    expect(service.isLoggedIn()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(service.currentRole()).toBe('ADMIN');
    // Admin users never hold subscriptions
    expect(service.currentTier()).toBe('FREE');
    expect(service.hasActiveSubscription()).toBe(false);
  });

  it('should compute currentTier as BASIC and hasActiveSubscription as true for Basic subscriber', () => {
    const basicUser: User = {
      id: 'basic-1',
      email: 'basic@example.com',
      firstName: 'Basic',
      lastName: 'User',
      name: 'Basic User',
      role: 'USER',
      tier: 'BASIC',
      isActive: true,
      createdAt: '',
      updatedAt: '',
      subscription: {
        id: 'sub-1',
        userId: 'basic-1',
        plan: 'BASIC',
        billingPeriod: 'MONTHLY',
        renewalConsent: true,
        termsAccepted: true,
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: '',
      },
    };

    service.setMockUser(basicUser, 'basic-token');

    expect(service.isLoggedIn()).toBe(true);
    expect(service.isAdmin()).toBe(false);
    expect(service.currentTier()).toBe('BASIC');
    expect(service.hasActiveSubscription()).toBe(true);
  });

  it('should compute currentTier as PREMIUM and hasActiveSubscription as true for Premium subscriber', () => {
    const premiumUser: User = {
      id: 'prem-1',
      email: 'premium@example.com',
      firstName: 'Premium',
      lastName: 'User',
      name: 'Premium User',
      role: 'USER',
      tier: 'PREMIUM',
      isActive: true,
      createdAt: '',
      updatedAt: '',
      subscription: {
        id: 'sub-2',
        userId: 'prem-1',
        plan: 'PREMIUM',
        billingPeriod: 'ANNUAL',
        renewalConsent: true,
        termsAccepted: true,
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: '',
      },
    };

    service.setMockUser(premiumUser, 'prem-token');

    expect(service.isLoggedIn()).toBe(true);
    expect(service.isAdmin()).toBe(false);
    expect(service.currentTier()).toBe('PREMIUM');
    expect(service.hasActiveSubscription()).toBe(true);
  });

  it('should compute currentTier as FREE and hasActiveSubscription as false for free user', () => {
    const freeUser: User = {
      id: 'free-1',
      email: 'free@example.com',
      firstName: 'Free',
      lastName: 'User',
      name: 'Free User',
      role: 'USER',
      tier: 'FREE',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    service.setMockUser(freeUser, 'free-token');

    expect(service.isLoggedIn()).toBe(true);
    expect(service.isAdmin()).toBe(false);
    expect(service.currentTier()).toBe('FREE');
    expect(service.hasActiveSubscription()).toBe(false);
  });

  it('should handle registration and update auth state', () => {
    const newUser: User = {
      id: 'new-1',
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      name: 'New Registered User',
      role: 'USER',
      tier: 'FREE',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };

    mockHttpClient.post.mockReturnValue(
      of({ accessToken: 'registered-token', user: newUser }),
    );

    service.register({ email: 'new@example.com', password: 'Password123!', firstName: 'New', lastName: 'User' }).subscribe();

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.email).toBe('new@example.com');
    expect(service.accessToken()).toBe('registered-token');
  });

  it('should handle updateProfile and update currentUser signal and storage', () => {
    const existingUser: User = {
      id: 'u-1',
      email: 'user@example.com',
      firstName: 'Old',
      lastName: 'Name',
      role: 'USER',
      tier: 'FREE',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    service.setMockUser(existingUser, 'token-123');

    const updatedUser: User = {
      ...existingUser,
      firstName: 'New',
      lastName: 'Updated',
      avatarUrl: 'https://example.com/avatar.png',
      twoFactorEnabled: true,
    };

    mockHttpClient.patch.mockReturnValue(of(updatedUser));

    service.updateProfile({ firstName: 'New', lastName: 'Updated' }).subscribe();

    expect(mockHttpClient.patch).toHaveBeenCalledWith('auth/profile', {
      firstName: 'New',
      lastName: 'Updated',
    });
    expect(service.currentUser()?.firstName).toBe('New');
    expect(service.currentUser()?.lastName).toBe('Updated');
    expect(service.currentUser()?.avatarUrl).toBe('https://example.com/avatar.png');
    expect(service.currentUser()?.twoFactorEnabled).toBe(true);
  });

  it('should clear state on logout', () => {
    service.setMockUser({
      id: 'u-1',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    expect(service.isLoggedIn()).toBe(true);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.accessToken()).toBeNull();
  });

  describe('Admin Logout Redirection', () => {
    let mockRouter: {
      url: string;
      navigate: any;
    };
    let routerService: AuthService;

    beforeEach(() => {
      mockRouter = {
        url: '/',
        navigate: vi.fn(),
      };

      const injector = Injector.create({
        providers: [
          AuthService,
          { provide: HttpClient, useValue: mockHttpClient },
          { provide: Router, useValue: mockRouter },
        ],
      });

      routerService = injector.get(AuthService);
    });

    it('should redirect to home page when an admin user logs out while on /admin', () => {
      mockRouter.url = '/admin';
      routerService.setMockUser({
        id: 'admin-1',
        email: 'admin@eldugoutve.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      expect(routerService.isAdmin()).toBe(true);

      routerService.logout();

      expect(routerService.isLoggedIn()).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should redirect to home page when an admin user logs out while on /admin/imports', () => {
      mockRouter.url = '/admin/imports?batch=123';
      routerService.setMockUser({
        id: 'admin-1',
        email: 'admin@eldugoutve.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      routerService.logout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should redirect to home page when an admin user logs out while on /users', () => {
      mockRouter.url = '/users';
      routerService.setMockUser({
        id: 'admin-1',
        email: 'admin@eldugoutve.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      routerService.logout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should not redirect if user logs out while on the home page /', () => {
      mockRouter.url = '/';
      routerService.setMockUser({
        id: 'admin-1',
        email: 'admin@eldugoutve.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      routerService.logout();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should correctly evaluate isAdminRoute for admin and non-admin routes', () => {
      expect(routerService.isAdminRoute('/admin')).toBe(true);
      expect(routerService.isAdminRoute('/admin/imports')).toBe(true);
      expect(routerService.isAdminRoute('/users')).toBe(true);
      expect(routerService.isAdminRoute('/profile')).toBe(false);
      expect(routerService.isAdminRoute('/')).toBe(false);
    });
  });
});
