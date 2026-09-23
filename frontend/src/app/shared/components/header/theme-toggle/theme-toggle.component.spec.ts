// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, signal, PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService, ThemeMode } from '../../../../core/services/theme.service';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let mockThemeService: {
    theme: ReturnType<typeof signal<ThemeMode>>;
    isDark: ReturnType<typeof signal<boolean>>;
    isLight: ReturnType<typeof signal<boolean>>;
    toggleTheme: any;
  };

  beforeEach(() => {
    const themeSig = signal<ThemeMode>('dark');
    mockThemeService = {
      theme: themeSig,
      isDark: signal<boolean>(true),
      isLight: signal<boolean>(false),
      toggleTheme: vi.fn(() => {
        const next = themeSig() === 'dark' ? 'light' : 'dark';
        themeSig.set(next);
        mockThemeService.isDark.set(next === 'dark');
        mockThemeService.isLight.set(next === 'light');
      }),
    };

    const injector = Injector.create({
      providers: [
        ThemeToggleComponent,
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    component = injector.get(ThemeToggleComponent);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.themeService.isDark()).toBe(true);
  });

  it('should call themeService.toggleTheme() on toggleTheme()', () => {
    component.toggleTheme();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('should trigger temporary spinning animation on click', () => {
    expect(component.isSpinning()).toBe(false);
    component.toggleTheme();
    expect(component.isSpinning()).toBe(true);
  });

  it('should reflect light theme state when toggled', () => {
    component.toggleTheme();
    expect(mockThemeService.isDark()).toBe(false);
    expect(mockThemeService.isLight()).toBe(true);
  });
});
