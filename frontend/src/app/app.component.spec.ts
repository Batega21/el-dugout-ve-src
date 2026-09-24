// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppComponent } from './app.component';
import { ThemeService } from './core/services/theme.service';
import { LanguageService } from './core/services/language.service';
import { ActivatedRoute } from '@angular/router';

describe('AppComponent', () => {
  let component: AppComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        {
          provide: ThemeService,
          useValue: {
            theme: signal('dark'),
            isDark: signal(true),
            isLight: signal(false),
            toggleTheme: vi.fn(),
            setTheme: vi.fn(),
          },
        },
        {
          provide: LanguageService,
          useValue: {
            currentLang: signal('es'),
            availableLangs: ['es', 'en'],
            setLanguage: vi.fn(),
            toggleLanguage: vi.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    });

    component = runInInjectionContext(injector, () => new AppComponent());
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject ThemeService and LanguageService', () => {
    expect(component.themeService).toBeDefined();
    expect(component.languageService).toBeDefined();
  });

  it('should have default footer data configured', () => {
    expect(component.footerData).toBeDefined();
    expect(component.footerData.brand.name).toBe('FOOTER.BRAND_NAME');
    expect(component.footerData.sections?.length).toBeGreaterThan(0);
  });
});
