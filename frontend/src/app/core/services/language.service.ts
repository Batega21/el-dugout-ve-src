import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLanguage = 'es' | 'en';

export const LANGUAGE_STORAGE_KEY = 'venebeisbol_lang';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'es';
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['es', 'en'] as const;

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly translate = inject(TranslateService);

  /**
   * Reactive signal representing the currently selected application language.
   */
  readonly selectedLang = signal<SupportedLanguage>(DEFAULT_LANGUAGE);

  readonly isSpanish = computed(() => this.selectedLang() === 'es');
  readonly isEnglish = computed(() => this.selectedLang() === 'en');

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Initializes language settings, fallback, and retrieves stored preference.
   */
  private initializeLanguage(): void {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    this.translate.setFallbackLang(DEFAULT_LANGUAGE);

    const storedLang = this.getStoredLanguage();
    this.setLanguage(storedLang);
  }

  /**
   * Sets the current active language, persists to localStorage, and switches translations.
   */
  setLanguage(lang: SupportedLanguage): void {
    const validLang: SupportedLanguage = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    this.selectedLang.set(validLang);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, validLang);
      } catch (e) {
        console.warn('Failed to persist language preference in localStorage:', e);
      }
    }

    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = validLang;
    }

    this.translate.use(validLang);
  }

  /**
   * Toggles between Spanish and English.
   */
  toggleLanguage(): void {
    const nextLang: SupportedLanguage = this.selectedLang() === 'es' ? 'en' : 'es';
    this.setLanguage(nextLang);
  }

  /**
   * Safely reads the user preference from localStorage.
   */
  private getStoredLanguage(): SupportedLanguage {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored === 'es' || stored === 'en') {
          return stored;
        }
      } catch (e) {
        console.warn('Unable to access localStorage for language preference:', e);
      }
    }
    return DEFAULT_LANGUAGE;
  }
}
