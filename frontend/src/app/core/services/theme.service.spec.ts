// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeService, THEME_STORAGE_KEY } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    if (document.body) {
      document.body.className = '';
    }

    const injector = Injector.create({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = injector.get(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default "dark" theme', () => {
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(service.isLight()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle theme between dark and light', () => {
    expect(service.theme()).toBe('dark');

    service.toggleTheme();
    expect(service.theme()).toBe('light');
    expect(service.isLight()).toBe(true);
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    service.toggleTheme();
    expect(service.theme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(service.isLight()).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('should explicitly set theme and persist to localStorage', () => {
    service.setTheme('light');
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');

    service.setTheme('dark');
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('should restore previously saved theme from localStorage on startup', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const injector = Injector.create({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const newService = injector.get(ThemeService);

    expect(newService.theme()).toBe('light');
    expect(newService.isLight()).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });
});
