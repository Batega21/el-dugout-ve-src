// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LanguageToggleComponent } from './language-toggle.component';
import { LanguageService, SupportedLanguage } from '../../../../core/services/language.service';

describe('LanguageToggleComponent', () => {
  let component: LanguageToggleComponent;
  let mockLanguageService: {
    selectedLang: ReturnType<typeof signal<SupportedLanguage>>;
    setLanguage: any;
    toggleLanguage: any;
  };

  beforeEach(() => {
    const langSig = signal<SupportedLanguage>('es');
    mockLanguageService = {
      selectedLang: langSig,
      setLanguage: vi.fn((lang: SupportedLanguage) => {
        langSig.set(lang);
      }),
      toggleLanguage: vi.fn(() => {
        const next = langSig() === 'es' ? 'en' : 'es';
        langSig.set(next);
      }),
    };

    const injector = Injector.create({
      providers: [
        LanguageToggleComponent,
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    });

    component = injector.get(LanguageToggleComponent);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create the language toggle component', () => {
    expect(component).toBeTruthy();
  });

  it('should default to Spanish (es)', () => {
    expect(component.selectedLang()).toBe('es');
  });

  it('should switch to English when setLang("en") is invoked', () => {
    component.setLang('en');
    expect(mockLanguageService.setLanguage).toHaveBeenCalledWith('en');
    expect(component.selectedLang()).toBe('en');
  });

  it('should switch back to Spanish when setLang("es") is invoked', () => {
    component.setLang('en');
    expect(component.selectedLang()).toBe('en');

    component.setLang('es');
    expect(mockLanguageService.setLanguage).toHaveBeenCalledWith('es');
    expect(component.selectedLang()).toBe('es');
  });
});
