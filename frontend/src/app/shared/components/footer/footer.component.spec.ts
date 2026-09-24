import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
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
});
