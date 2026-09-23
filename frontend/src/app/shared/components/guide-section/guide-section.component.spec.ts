// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { GuideSectionComponent } from './guide-section.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

describe('GuideSectionComponent', () => {
  let component: GuideSectionComponent;
  let injector: Injector;

  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
    isAdmin: () => boolean;
    isLoggedIn: () => boolean;
  };

  beforeEach(() => {
    const userSignal = signal<User | null>(null);

    mockAuthService = {
      currentUser: userSignal,
      isAdmin: () => userSignal()?.role === 'ADMIN',
      isLoggedIn: () => !!userSignal(),
    };

    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    component = runInInjectionContext(injector, () => new GuideSectionComponent());
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should not allow viewing when user is unauthenticated', () => {
    expect(component.canView()).toBe(false);
  });

  it('should not allow viewing when user is logged in with standard USER role', () => {
    mockAuthService.currentUser.set({
      id: 'u-1',
      email: 'user@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    expect(component.canView()).toBe(false);
  });

  it('should allow viewing when user is logged in with ADMIN role', () => {
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

    expect(component.canView()).toBe(true);
  });

  it('should allow viewing when forceVisible is true even if user is not admin', () => {
    (component as any).forceVisible = signal(true);
    expect(component.canView()).toBe(true);
  });

  it('should block viewing when forceVisible is false even if user is admin', () => {
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
    (component as any).forceVisible = signal(false);

    expect(component.canView()).toBe(false);
  });
});
