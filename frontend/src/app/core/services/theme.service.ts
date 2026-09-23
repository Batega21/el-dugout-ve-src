import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'el_dugout_theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID, { optional: true }) ?? 'browser';
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /**
   * Internal reactive signal for the active theme mode.
   * Defaults to 'dark' per design specifications.
   */
  readonly theme = signal<ThemeMode>(this.getInitialTheme());

  /**
   * Computed boolean checking if dark mode is active.
   */
  readonly isDark = computed(() => this.theme() === 'dark');

  /**
   * Computed boolean checking if light mode is active.
   */
  readonly isLight = computed(() => this.theme() === 'light');

  constructor() {
    this.applyTheme(this.theme());
  }

  /**
   * Toggles between 'dark' and 'light' modes.
   */
  toggleTheme(): void {
    const nextTheme: ThemeMode = this.theme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  /**
   * Sets the active theme explicitly and persists it.
   */
  setTheme(mode: ThemeMode): void {
    this.theme.set(mode);
    this.applyTheme(mode);
    this.persistTheme(mode);
  }

  /**
   * Determines initial theme based on localStorage, defaulting to 'dark'.
   */
  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      return 'dark';
    }

    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // Ignore localStorage errors (e.g. private mode or sandbox)
    }

    return 'dark';
  }

  /**
   * Updates HTML root attributes and classes to reflect active theme.
   */
  private applyTheme(mode: ThemeMode): void {
    if (!this.isBrowser || typeof document === 'undefined') {
      return;
    }

    const root = document.documentElement;
    const body = document.body;

    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      body?.classList.add('dark');
      body?.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      body?.classList.add('light');
      body?.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  }

  /**
   * Persists theme selection to localStorage.
   */
  private persistTheme(mode: ThemeMode): void {
    if (!this.isBrowser || typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore localStorage write failures
    }
  }
}
