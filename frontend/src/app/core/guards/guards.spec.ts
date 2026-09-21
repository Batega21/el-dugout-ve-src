import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard } from './admin.guard';
import { subscriptionGuard } from './subscription.guard';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';
import { SubscriptionTier } from '../models/subscription.model';

describe('Functional Route Guards (RBAC & Subscription Entitlements)', () => {
  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
    isAdmin: () => boolean;
    isLoggedIn: () => boolean;
    currentTier: () => SubscriptionTier;
    hasActiveSubscription: () => boolean;
  };

  let mockRouter: {
    createUrlTree: any;
  };

  let injector: Injector;

  beforeEach(() => {
    const userSignal = signal<User | null>(null);

    mockAuthService = {
      currentUser: userSignal,
      isAdmin: () => userSignal()?.role === 'ADMIN',
      isLoggedIn: () => !!userSignal(),
      currentTier: () => {
        const u = userSignal();
        if (!u || u.role === 'ADMIN') return 'FREE';
        return u.tier || 'FREE';
      },
      hasActiveSubscription: () => {
        const u = userSignal();
        if (!u || u.role === 'ADMIN') return false;
        return u.tier === 'BASIC' || u.tier === 'PREMIUM';
      },
    };

    mockRouter = {
      createUrlTree: vi.fn((commands: any[], extras?: any) => ({ commands, extras } as unknown as UrlTree)),
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  describe('adminGuard', () => {
    it('should permit navigation (return true) when user is ADMIN', () => {
      mockAuthService.currentUser.set({
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const result = runInInjectionContext(injector, () =>
        adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).toBe(true);
    });

    it('should block navigation and redirect to root when user is standard USER', () => {
      mockAuthService.currentUser.set({
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Standard',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const result = runInInjectionContext(injector, () =>
        adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
    });

    it('should block navigation and redirect to root when unauthenticated', () => {
      mockAuthService.currentUser.set(null);

      const result = runInInjectionContext(injector, () =>
        adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
    });
  });

  describe('subscriptionGuard', () => {
    it('should allow ADMIN to bypass all subscription checks regardless of tier', () => {
      mockAuthService.currentUser.set({
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const routeSnapshot = {
        data: { requiredTier: 'PREMIUM' },
      } as unknown as ActivatedRouteSnapshot;

      const result = runInInjectionContext(injector, () =>
        subscriptionGuard(routeSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).toBe(true);
    });

    it('should allow PREMIUM user to access PREMIUM route', () => {
      mockAuthService.currentUser.set({
        id: 'prem-1',
        email: 'premium@example.com',
        firstName: 'Premium',
        lastName: 'User',
        role: 'USER',
        tier: 'PREMIUM',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const routeSnapshot = {
        data: { requiredTier: 'PREMIUM' },
      } as unknown as ActivatedRouteSnapshot;

      const result = runInInjectionContext(injector, () =>
        subscriptionGuard(routeSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).toBe(true);
    });

    it('should block FREE tier user from accessing PREMIUM route and redirect with upgrade param', () => {
      mockAuthService.currentUser.set({
        id: 'free-1',
        email: 'free@example.com',
        firstName: 'Free',
        lastName: 'User',
        role: 'USER',
        tier: 'FREE',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const routeSnapshot = {
        data: { requiredTier: 'PREMIUM' },
      } as unknown as ActivatedRouteSnapshot;

      const result = runInInjectionContext(injector, () =>
        subscriptionGuard(routeSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/'], {
        queryParams: { upgrade: 'PREMIUM' },
      });
    });

    it('should block BASIC tier user from accessing PREMIUM route', () => {
      mockAuthService.currentUser.set({
        id: 'basic-1',
        email: 'basic@example.com',
        firstName: 'Basic',
        lastName: 'User',
        role: 'USER',
        tier: 'BASIC',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const routeSnapshot = {
        data: { requiredTier: 'PREMIUM' },
      } as unknown as ActivatedRouteSnapshot;

      const result = runInInjectionContext(injector, () =>
        subscriptionGuard(routeSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/'], {
        queryParams: { upgrade: 'PREMIUM' },
      });
    });

    it('should allow BASIC tier user to access BASIC route', () => {
      mockAuthService.currentUser.set({
        id: 'basic-1',
        email: 'basic@example.com',
        firstName: 'Basic',
        lastName: 'User',
        role: 'USER',
        tier: 'BASIC',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const routeSnapshot = {
        data: { requiredTier: 'BASIC' },
      } as unknown as ActivatedRouteSnapshot;

      const result = runInInjectionContext(injector, () =>
        subscriptionGuard(routeSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).toBe(true);
    });
  });

  describe('authGuard', () => {
    it('should permit navigation (return true) when user is logged in', () => {
      mockAuthService.currentUser.set({
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'Standard',
        lastName: 'User',
        role: 'USER',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      });

      const result = runInInjectionContext(injector, () =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).toBe(true);
    });

    it('should block navigation and redirect to root when unauthenticated', () => {
      mockAuthService.currentUser.set(null);

      const result = runInInjectionContext(injector, () =>
        authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
      );

      expect(result).not.toBe(true);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
    });
  });
});
