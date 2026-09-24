// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { PremiumFeatureComponent } from './premium-feature.component';

describe('PremiumFeatureComponent', () => {
  let component: PremiumFeatureComponent;
  let injector: Injector;

  let mockHttpClient: {
    get: any;
  };

  const sampleFeatureData = {
    tier: 'PREMIUM',
    featureName: 'Advanced Sabermetrics Analysis',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(() => of(sampleFeatureData)),
    };

    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });

    component = runInInjectionContext(injector, () => new PremiumFeatureComponent());
  });

  it('should create the premium feature component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch premium feature data on ngOnInit', () => {
    component.ngOnInit();
    expect(mockHttpClient.get).toHaveBeenCalledWith('features/premium');
    expect(component.featureData()).toEqual(sampleFeatureData);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when premium access is denied', () => {
    mockHttpClient.get.mockReturnValue(
      throwError(() => ({ error: { message: 'Access Denied: Insufficient Tier' } })),
    );

    component.ngOnInit();
    expect(component.errorMessage()).toBe('Access Denied: Insufficient Tier');
    expect(component.loading()).toBe(false);
    expect(component.featureData()).toBeNull();
  });
});
