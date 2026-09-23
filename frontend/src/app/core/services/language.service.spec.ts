// @vitest-environment jsdom
import '@angular/compiler';
import { Injector } from '@angular/core';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LanguageService, LANGUAGE_STORAGE_KEY } from './language.service';
import { TranslateService } from '@ngx-translate/core';

describe('LanguageService', () => {
  let service: LanguageService;
  let mockTranslate: {
    addLangs: any;
    setFallbackLang: any;
    use: any;
  };

  beforeEach(() => {
    localStorage.clear();

    mockTranslate = {
      addLangs: vi.fn(),
      setFallbackLang: vi.fn(),
      use: vi.fn(),
    };

    const injector = Injector.create({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: mockTranslate },
      ],
    });

    service = injector.get(LanguageService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with default "es" and register languages', () => {
    expect(mockTranslate.addLangs).toHaveBeenCalledWith(['es', 'en']);
    expect(mockTranslate.setFallbackLang).toHaveBeenCalledWith('es');
    expect(mockTranslate.use).toHaveBeenCalledWith('es');
    expect(service.selectedLang()).toBe('es');
    expect(service.isSpanish()).toBe(true);
    expect(service.isEnglish()).toBe(false);
  });

  it('should switch to English, update signal, localStorage, and translate service', () => {
    service.setLanguage('en');

    expect(service.selectedLang()).toBe('en');
    expect(service.isEnglish()).toBe(true);
    expect(service.isSpanish()).toBe(false);
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en');
    expect(mockTranslate.use).toHaveBeenCalledWith('en');
  });

  it('should toggle language between es and en', () => {
    expect(service.selectedLang()).toBe('es');

    service.toggleLanguage();
    expect(service.selectedLang()).toBe('en');

    service.toggleLanguage();
    expect(service.selectedLang()).toBe('es');
  });

  it('should read persisted language preference from localStorage on initialization', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');

    const newMockTranslate = {
      addLangs: vi.fn(),
      setFallbackLang: vi.fn(),
      use: vi.fn(),
    };

    const injector = Injector.create({
      providers: [
        LanguageService,
        { provide: TranslateService, useValue: newMockTranslate },
      ],
    });

    const newService = injector.get(LanguageService);
    expect(newService.selectedLang()).toBe('en');
    expect(newMockTranslate.use).toHaveBeenCalledWith('en');
  });
});
