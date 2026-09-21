import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { SectionComponent } from './section.component';
import { DEFAULT_SECTION_CONFIG, SectionConfig } from './section.interface';

describe('SectionComponent', () => {
  let component: SectionComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [] });
    component = runInInjectionContext(injector, () => new SectionComponent());
  });

  it('should create the section component', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve default config values matching DEFAULT_SECTION_CONFIG', () => {
    expect(component.resolvedAlign()).toBe('left');
    expect(component.resolvedTitle()).toBe(DEFAULT_SECTION_CONFIG.title);
    expect(component.resolvedDescription()).toBe(DEFAULT_SECTION_CONFIG.description);
    expect(component.resolvedMediaImage()).toBe(DEFAULT_SECTION_CONFIG.media?.image);
    expect(component.resolvedMediaText()).toBe(DEFAULT_SECTION_CONFIG.media?.text);
    expect(component.resolvedMediaAlt()).toBe(DEFAULT_SECTION_CONFIG.media?.alt);
  });

  it('should accept custom SectionConfig signal and update resolved computed properties', () => {
    const customConfig: SectionConfig = {
      align: 'right',
      background: 'https://images.unsplash.com/photo-1451187580459',
      parallax: true,
      title: 'Custom Title',
      description: 'Custom Description',
      media: {
        image: 'https://images.unsplash.com/custom.png',
        text: 'Custom Media Text',
        alt: 'Custom Alt Text',
      },
    };

    (component as any).config = signal(customConfig);

    expect(component.resolvedAlign()).toBe('right');
    expect(component.resolvedTitle()).toBe('Custom Title');
    expect(component.resolvedDescription()).toBe('Custom Description');
    expect(component.resolvedMediaImage()).toBe('https://images.unsplash.com/custom.png');
    expect(component.resolvedMediaText()).toBe('Custom Media Text');
    expect(component.resolvedMediaAlt()).toBe('Custom Alt Text');
    expect(component.isImageBackground()).toBe(true);
    expect(component.isParallaxActive()).toBe(true);
    expect(component.sectionStyle()['background-attachment']).toBe('fixed');
    expect(component.hasCustomBg()).toBe(true);
  });

  it('should handle solid color background properly', () => {
    (component as any).config = signal<SectionConfig>({
      background: '#1e293b',
    });

    expect(component.isImageBackground()).toBe(false);
    expect(component.hasCustomBg()).toBe(true);
    expect(component.sectionStyle()['background-color']).toBe('#1e293b');
  });

  it('should support flat mediaImage and mediaText properties in SectionConfig', () => {
    (component as any).config = signal<SectionConfig>({
      mediaImage: 'https://example.com/flat.jpg',
      mediaText: 'Flat Media Caption',
    });

    expect(component.resolvedMediaImage()).toBe('https://example.com/flat.jpg');
    expect(component.resolvedMediaText()).toBe('Flat Media Caption');
  });
});
