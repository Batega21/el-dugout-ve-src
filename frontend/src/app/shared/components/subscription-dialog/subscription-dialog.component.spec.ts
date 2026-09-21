import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { SubscriptionDialogComponent } from './subscription-dialog.component';
import { SubscriptionsService } from '../../../core/services/subscriptions.service';

describe('SubscriptionDialogComponent', () => {
  let component: SubscriptionDialogComponent;
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  let subscriptionsServiceMock: { createSubscription: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    dialogRefMock = {
      close: vi.fn(),
    };

    subscriptionsServiceMock = {
      createSubscription: vi.fn().mockReturnValue(
        of({
          id: 'mock-id',
          userId: 'mock-user-id',
          plan: 'PREMIUM',
          billingPeriod: 'ANNUAL',
          renewalConsent: true,
          termsAccepted: true,
          status: 'TRIALING',
        })
      ),
    };

    const injector = Injector.create({
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: SubscriptionsService, useValue: subscriptionsServiceMock },
      ],
    });

    component = runInInjectionContext(injector, () => new SubscriptionDialogComponent());
  });

  it('should initialize with default plan as premium, billing as monthly, and renewal consent as true', () => {
    expect(component.subscriptionForm.controls.plan.value).toBe('premium');
    expect(component.subscriptionForm.controls.billingPeriod.value).toBe('monthly');
    expect(component.subscriptionForm.controls.renewalConsent.value).toBe(true);
  });

  it('should toggle plan selection when selectPlan is invoked', () => {
    component.selectPlan('free');
    expect(component.subscriptionForm.controls.plan.value).toBe('free');

    component.selectPlan('premium');
    expect(component.subscriptionForm.controls.plan.value).toBe('premium');
  });

  it('should toggle billing period when selectBillingPeriod is invoked', () => {
    component.selectBillingPeriod('annual');
    expect(component.subscriptionForm.controls.billingPeriod.value).toBe('annual');

    component.selectBillingPeriod('monthly');
    expect(component.subscriptionForm.controls.billingPeriod.value).toBe('monthly');
  });

  it('should close dialog with null when onCancel is called', () => {
    component.onCancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(null);
  });

  it('should clear renewalConsent validator when free plan is selected', () => {
    component.selectPlan('free');
    component.subscriptionForm.controls.renewalConsent.setValue(false);
    expect(component.subscriptionForm.controls.renewalConsent.valid).toBe(true);
    expect(component.subscriptionForm.valid).toBe(true);

    component.selectPlan('premium');
    expect(component.subscriptionForm.controls.renewalConsent.valid).toBe(false);
    expect(component.subscriptionForm.valid).toBe(false);
  });

  it('should prevent submission when required fields are missing or invalid', () => {
    component.subscriptionForm.controls.plan.setValue('' as any);
    expect(component.subscriptionForm.invalid).toBe(true);
    component.onSubmit();
    expect(subscriptionsServiceMock.createSubscription).not.toHaveBeenCalled();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should close dialog with persisted subscription when valid form is submitted', () => {
    component.subscriptionForm.setValue({
      plan: 'premium',
      billingPeriod: 'annual',
      renewalConsent: true,
    });

    expect(component.subscriptionForm.valid).toBe(true);
    component.onSubmit();

    expect(subscriptionsServiceMock.createSubscription).toHaveBeenCalledWith({
      plan: 'premium',
      billingPeriod: 'annual',
      renewalConsent: true,
      termsAccepted: true,
    });

    expect(dialogRefMock.close).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'mock-id',
        plan: 'PREMIUM',
      })
    );
  });

  it('should display error message when createSubscription fails', () => {
    subscriptionsServiceMock.createSubscription.mockReturnValue(
      throwError(() => ({ error: { message: 'You already have an active subscription' } }))
    );

    component.selectPlan('free');
    component.subscriptionForm.setValue({
      plan: 'free',
      billingPeriod: 'monthly',
      renewalConsent: false,
    });

    component.onSubmit();

    expect(component.isSubmitting()).toBe(false);
    expect(component.errorMessage()).toBe('You already have an active subscription');
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
