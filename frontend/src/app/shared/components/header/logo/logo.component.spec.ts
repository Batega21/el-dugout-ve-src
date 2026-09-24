// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  let component: LogoComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [] });
    component = runInInjectionContext(injector, () => new LogoComponent());
  });

  it('should create the logo component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title "El Dugout Ve"', () => {
    expect(component.title()).toBe('El Dugout Ve');
  });

  it('should accept custom title signal input', () => {
    (component as any).title = signal('Custom Brand');
    expect(component.title()).toBe('Custom Brand');
  });
});
