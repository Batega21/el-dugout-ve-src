import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { FooterComponent } from './footer.component';
import { DEFAULT_FOOTER_CONFIG, FooterConfig } from './footer.interface';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [] });
    component = runInInjectionContext(injector, () => new FooterComponent());
  });

  it('should create the footer component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default configuration matching DEFAULT_FOOTER_CONFIG with i18n translation keys', () => {
    const config = component.config();
    expect(config).toEqual(DEFAULT_FOOTER_CONFIG);
    expect(config.brand?.name).toBe('FOOTER.BRAND_NAME');
    expect(config.brand?.slogan).toBe('FOOTER.BRAND_SLOGAN');
    expect(config.brand?.aboutTitle).toBe('FOOTER.ABOUT_TITLE');
    expect(config.brand?.aboutText).toBe('FOOTER.ABOUT_TEXT');
    expect(config.sections?.length).toBe(2);
    expect(config.sections?.[0].title).toBe('FOOTER.CONTENT_TITLE');
    expect(config.sections?.[0].links[0].label).toBe('FOOTER.TEAMS');
    expect(config.contact?.title).toBe('FOOTER.CONTACT');
    expect(config.contact?.items[0].label).toBe('FOOTER.WEB_LABEL');
    expect(config.contact?.items[1].label).toBe('FOOTER.EMAIL_LABEL');
    expect(config.newsletter?.placeholder).toBe('FOOTER.NEWSLETTER_PLACEHOLDER');
    expect(config.newsletter?.buttonAriaLabel).toBe('FOOTER.NEWSLETTER_BTN_ARIA');
    expect(config.social?.title).toBe('FOOTER.FOLLOW_US');
    expect(config.social?.items.length).toBe(4);
    expect(config.bottom?.links[0].label).toBe('FOOTER.PRIVACY');
    expect(config.bottom?.links[1].label).toBe('FOOTER.TERMS_OF_SERVICE');
    expect(config.bottom?.copyright).toBe('FOOTER.COPYRIGHT');
  });

  it('should allow custom configuration to be provided via signal input', () => {
    const customConfig: FooterConfig = {
      brand: {
        name: 'CUSTOM.BRAND',
        slogan: 'CUSTOM.SLOGAN',
      },
      sections: [],
    };
    (component as any).config = signal(customConfig);
    expect(component.config()).toEqual(customConfig);
    expect(component.config().brand?.name).toBe('CUSTOM.BRAND');
  });

  it('should update newsletterEmail signal on email input event', () => {
    const mockInputEvent = {
      target: { value: 'test@example.com' } as unknown as HTMLInputElement,
    } as unknown as Event;

    // Call protected method
    (component as any).onEmailInput(mockInputEvent);
    expect((component as any).newsletterEmail()).toBe('test@example.com');
  });

  it('should emit newsletterSubmit and reset email input when submitting valid email', () => {
    let emittedEmail = '';
    component.newsletterSubmit.subscribe((val) => {
      emittedEmail = val;
    });

    (component as any).newsletterEmail.set('user@acme.org');
    (component as any).onNewsletterSubmit();

    expect(emittedEmail).toBe('user@acme.org');
    expect((component as any).newsletterEmail()).toBe('');
  });

  it('should not emit newsletterSubmit if email is empty or whitespace', () => {
    let emitted = false;
    component.newsletterSubmit.subscribe(() => {
      emitted = true;
    });

    (component as any).newsletterEmail.set('   ');
    (component as any).onNewsletterSubmit();

    expect(emitted).toBe(false);
  });

  describe('Background images & theme integration', () => {
    let mockThemeService: { theme: any; isDark: any };

    beforeEach(() => {
      const isDarkSig = signal(true);
      mockThemeService = {
        theme: signal('dark'),
        isDark: isDarkSig,
      };
      injector = Injector.create({
        providers: [{ provide: ThemeService, useValue: mockThemeService }],
      });
      component = runInInjectionContext(injector, () => new FooterComponent());
    });

    it('should default to dark background image and full black (#000000) background color when dark theme is active', () => {
      expect(component.darkImage()).toBe('/public/images/background-3-dark-version');
      expect(component.lightImage()).toBe('/public/images/background-3-light-version');
      expect(component.currentImage()).toBe('/public/images/background-3-dark-version');
      expect(component.currentBgColor()).toBe('#000000');
      expect(component.footerBgStyle()).toEqual({
        'background-image': "url('/public/images/background-3-dark-version')",
        'background-color': '#000000',
      });
    });

    it('should switch to light background image and full white (#FFFFFF) background color when light theme is active', () => {
      mockThemeService.isDark.set(false);
      expect(component.currentImage()).toBe('/public/images/background-3-light-version');
      expect(component.currentBgColor()).toBe('#FFFFFF');
      expect(component.footerBgStyle()).toEqual({
        'background-image': "url('/public/images/background-3-light-version')",
        'background-color': '#FFFFFF',
      });
    });

    it('should allow custom dark and light images via signal inputs while maintaining theme background colors', () => {
      (component as any).darkImage = signal('/custom/dark.png');
      (component as any).lightImage = signal('/custom/light.jpeg');

      mockThemeService.isDark.set(true);
      expect(component.currentImage()).toBe('/custom/dark.png');
      expect(component.currentBgColor()).toBe('#000000');
      expect(component.footerBgStyle()).toEqual({
        'background-image': "url('/custom/dark.png')",
        'background-color': '#000000',
      });

      mockThemeService.isDark.set(false);
      expect(component.currentImage()).toBe('/custom/light.jpeg');
      expect(component.currentBgColor()).toBe('#FFFFFF');
      expect(component.footerBgStyle()).toEqual({
        'background-image': "url('/custom/light.jpeg')",
        'background-color': '#FFFFFF',
      });
    });

    it('should prioritize background config inside FooterConfig when provided', () => {
      (component as any).config = signal({
        ...DEFAULT_FOOTER_CONFIG,
        background: {
          dark: '/override/dark.png',
          light: '/override/light.jpg',
        },
      });

      mockThemeService.isDark.set(true);
      expect(component.currentImage()).toBe('/override/dark.png');

      mockThemeService.isDark.set(false);
      expect(component.currentImage()).toBe('/override/light.jpg');
    });
  });
});
