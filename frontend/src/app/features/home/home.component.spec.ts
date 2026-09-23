// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeComponent } from './home.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let injector: Injector;

  let mockRouter: {
    navigate: any;
  };

  let mockDialog: {
    open: any;
  };

  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
    isLoggedIn: () => boolean;
    isAdmin: () => boolean;
  };

  beforeEach(() => {
    const userSig = signal<User | null>(null);

    mockRouter = {
      navigate: vi.fn(),
    };

    mockDialog = {
      open: vi.fn(),
    };

    mockAuthService = {
      currentUser: userSig,
      isLoggedIn: () => !!userSig(),
      isAdmin: () => userSig()?.role === 'ADMIN',
    };

    injector = Injector.create({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    component = runInInjectionContext(injector, () => new HomeComponent());
  });

  it('should create the home component', () => {
    expect(component).toBeTruthy();
  });

  it('should define section1 and section2 configurations', () => {
    expect(component.section1Config.title).toBe('Historia, Equipos y Tradición de la LVBP');
    expect(component.section1Config.align).toBe('left');
    expect(component.section2Config.title).toBe('Estadísticas Históricas y Jugadores Legendarios');
    expect(component.section2Config.align).toBe('right');
  });

  it('should define batting and pitching carousel configurations', () => {
    expect(component.battingRecordsConfig).toBeDefined();
    expect(component.battingRecordsConfig.tables.length).toBe(4);
    const battingIds = component.battingRecordsConfig.tables.map((t) => t.id);
    expect(battingIds).toEqual(['home-runs', 'hits', 'batting-average', 'stolen-bases']);

    expect(component.pitchingRecordsConfig).toBeDefined();
    expect(component.pitchingRecordsConfig.tables.length).toBe(3);
    const pitchingIds = component.pitchingRecordsConfig.tables.map((t) => t.id);
    expect(pitchingIds).toEqual(['wins', 'strikeouts', 'saves']);
  });

  it('should open sign up dialog when unauthenticated user calls onSubscribe()', () => {
    mockDialog.open.mockReturnValue({
      afterClosed: () => ({
        subscribe: vi.fn(),
      }),
    });

    component.onSubscribe();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should open subscription dialog directly when user is logged in', () => {
    mockAuthService.currentUser.set({
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Baseball',
      lastName: 'Fan',
      role: 'USER',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    });

    component.onSubscribe();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should trigger external navigation on onCall()', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    component.onCall();
    expect(windowSpy).toHaveBeenCalledWith('https://cloud.google.com/run', '_blank');
    windowSpy.mockRestore();
  });
});
