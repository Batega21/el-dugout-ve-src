// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [] });
    component = runInInjectionContext(injector, () => new HeaderComponent());
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });
});
