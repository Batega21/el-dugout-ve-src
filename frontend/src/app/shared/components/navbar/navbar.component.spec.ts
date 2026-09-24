// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { NavbarComponent } from './navbar.component';
import { ActivatedRoute } from '@angular/router';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        { provide: ActivatedRoute, useValue: {} },
      ],
    });
    component = runInInjectionContext(injector, () => new NavbarComponent());
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });
});
