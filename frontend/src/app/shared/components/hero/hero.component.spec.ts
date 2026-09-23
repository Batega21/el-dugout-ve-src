// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, signal, PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HeroComponent } from './hero.component';
import { ThemeService, ThemeMode } from '../../../core/services/theme.service';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let mockThemeService: {
    theme: ReturnType<typeof signal<ThemeMode>>;
    isDark: ReturnType<typeof signal<boolean>>;
    isLight: ReturnType<typeof signal<boolean>>;
    setTheme: any;
    toggleTheme: any;
  };

  beforeEach(() => {
    const themeSig = signal<ThemeMode>('dark');
    const isDarkSig = signal<boolean>(true);
    const isLightSig = signal<boolean>(false);

    mockThemeService = {
      theme: themeSig,
      isDark: isDarkSig,
      isLight: isLightSig,
      setTheme: vi.fn((mode: ThemeMode) => {
        themeSig.set(mode);
        isDarkSig.set(mode === 'dark');
        isLightSig.set(mode === 'light');
      }),
      toggleTheme: vi.fn(() => {
        const next = themeSig() === 'dark' ? 'light' : 'dark';
        mockThemeService.setTheme(next);
      }),
    };

    const injector = Injector.create({
      providers: [
        HeroComponent,
        { provide: ThemeService, useValue: mockThemeService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    component = injector.get(HeroComponent);
  });

  it('should create the hero component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default content and CTA labels', () => {
    expect(component.tagline()).toBe('HERO.TAGLINE');
    expect(component.title()).toBe('HERO.TITLE');
    expect(component.description()).toBe('HERO.DESCRIPTION');
    expect(component.secondaryCta()).toBe('HERO.SECONDARY_CTA');
    expect(component.primaryCta()).toBe('HERO.PRIMARY_CTA');
  });

  it('should default to dark banner background image when dark theme is active', () => {
    expect(component.darkImage()).toBe('/images/hero_banner-09-2026-dark.jpeg');
    expect(component.lightImage()).toBe('/images/hero_banner-09-2026-light.jpeg');
    expect(component.currentImage()).toBe('/images/hero_banner-09-2026-dark.jpeg');
    expect(component.heroBgStyle()).toEqual({
      'background-image': "url('/images/hero_banner-09-2026-dark.jpeg')",
    });
  });

  it('should reactively switch background image to light banner when light theme is active', () => {
    mockThemeService.setTheme('light');
    expect(component.currentImage()).toBe('/images/hero_banner-09-2026-light.jpeg');
    expect(component.heroBgStyle()).toEqual({
      'background-image': "url('/images/hero_banner-09-2026-light.jpeg')",
    });
  });

  it('should accept custom dark and light images via signal inputs', () => {
    (component as any).darkImage = signal('/custom/dark.jpeg');
    (component as any).lightImage = signal('/custom/light.jpeg');

    expect(component.currentImage()).toBe('/custom/dark.jpeg');
    expect(component.heroBgStyle()).toEqual({
      'background-image': "url('/custom/dark.jpeg')",
    });

    mockThemeService.setTheme('light');
    expect(component.currentImage()).toBe('/custom/light.jpeg');
    expect(component.heroBgStyle()).toEqual({
      'background-image': "url('/custom/light.jpeg')",
    });
  });

  it('should default fullWidth to true', () => {
    expect(component.fullWidth()).toBe(true);
  });

  it('should emit primaryAction when onPrimaryClick is called', () => {
    const spy = vi.fn();
    component.primaryAction.subscribe(spy);
    component.onPrimaryClick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should emit secondaryAction when onSecondaryClick is called', () => {
    const spy = vi.fn();
    component.secondaryAction.subscribe(spy);
    component.onSecondaryClick();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should have default imageAlt and allow custom alt text', () => {
    expect(component.imageAlt()).toBe('HERO.IMAGE_ALT');
    (component as any).imageAlt = signal('Custom Alt Text');
    expect(component.imageAlt()).toBe('Custom Alt Text');
  });

  it('should accept custom values for all internationalized signal inputs', () => {
    (component as any).tagline = signal('CUSTOM.TAGLINE');
    (component as any).title = signal('CUSTOM.TITLE');
    (component as any).description = signal('CUSTOM.DESC');
    (component as any).secondaryCta = signal('CUSTOM.SEC_CTA');
    (component as any).primaryCta = signal('CUSTOM.PRI_CTA');
    (component as any).imageAlt = signal('CUSTOM.IMAGE_ALT');

    expect(component.tagline()).toBe('CUSTOM.TAGLINE');
    expect(component.title()).toBe('CUSTOM.TITLE');
    expect(component.description()).toBe('CUSTOM.DESC');
    expect(component.secondaryCta()).toBe('CUSTOM.SEC_CTA');
    expect(component.primaryCta()).toBe('CUSTOM.PRI_CTA');
    expect(component.imageAlt()).toBe('CUSTOM.IMAGE_ALT');
  });
});
