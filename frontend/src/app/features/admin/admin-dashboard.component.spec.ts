// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let injector: Injector;

  let mockHttpClient: {
    get: any;
  };

  const mockMetrics = {
    status: 'ONLINE',
    timestamp: '2026-09-24T12:00:00Z',
    uptimeSeconds: 1234,
    system: {
      heapUsedMb: 50,
      heapTotalMb: 100,
      rssMb: 120,
      nodeVersion: 'v22.0.0',
      platform: 'darwin',
    },
    businessTelemetry: {
      totalUsers: 42,
      totalSubscriptions: 15,
      activeSubscriptions: 12,
      subscriptionsByTier: { BASIC: 5, PREMIUM: 7 },
    },
  };

  const mockSubs = [
    {
      id: 'sub-1',
      plan: 'PREMIUM',
      billingPeriod: 'MONTHLY',
      status: 'ACTIVE',
      createdAt: '2026-09-01T00:00:00Z',
      user: {
        id: 'u-1',
        email: 'user1@example.com',
        firstName: 'Jose',
        lastName: 'Altuve',
      },
    },
  ];

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn((url: string) => {
        if (url === 'health/metrics') {
          return of(mockMetrics);
        }
        if (url === 'subscriptions') {
          return of(mockSubs);
        }
        return of(null);
      }),
    };

    injector = Injector.create({
      providers: [
        { provide: HttpClient, useValue: mockHttpClient },
      ],
    });

    component = runInInjectionContext(injector, () => new AdminDashboardComponent());
  });

  it('should create the admin dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should load metrics and subscriptions on ngOnInit', () => {
    component.ngOnInit();
    expect(mockHttpClient.get).toHaveBeenCalledWith('health/metrics');
    expect(mockHttpClient.get).toHaveBeenCalledWith('subscriptions');
    expect(component.metrics()).toEqual(mockMetrics);
    expect(component.subscriptions()).toEqual(mockSubs);
    expect(component.loading()).toBe(false);
  });

  it('should handle subscription fetch error', () => {
    mockHttpClient.get = vi.fn((url: string) => {
      if (url === 'health/metrics') return of(mockMetrics);
      return throwError(() => ({ error: { message: 'Unauthorized access' } }));
    });

    component.loadAll();
    expect(component.errorMessage()).toBe('Unauthorized access');
    expect(component.loading()).toBe(false);
  });
});
