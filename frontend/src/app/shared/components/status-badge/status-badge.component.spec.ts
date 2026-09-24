// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let injector: Injector;

  beforeEach(() => {
    injector = Injector.create({ providers: [] });
    component = runInInjectionContext(injector, () => new StatusBadgeComponent());
  });

  it('should create the status badge component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default input values', () => {
    expect(component.text).toBe('Active');
    expect(component.type).toBe('success');
  });

  it('should accept custom input values', () => {
    component.text = 'Inactive';
    component.type = 'danger';
    expect(component.text).toBe('Inactive');
    expect(component.type).toBe('danger');
  });
});
