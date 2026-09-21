import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
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

  it('should have default configuration matching DEFAULT_FOOTER_CONFIG', () => {
    const config = component.config();
    expect(config).toEqual(DEFAULT_FOOTER_CONFIG);
    expect(config.brand?.name).toBe('BRAND NAME');
    expect(config.brand?.slogan).toBe('Enter Your Slogan Here');
    expect(config.sections?.length).toBe(2);
    expect(config.contact?.title).toBe('Contact us');
    expect(config.social?.items.length).toBe(5);
    expect(config.bottom?.copyright).toContain('© 2025 Example Text');
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
