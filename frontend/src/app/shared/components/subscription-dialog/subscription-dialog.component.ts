import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SubscriptionsService } from '../../../core/services/subscriptions.service';
import { CreateSubscriptionInput, Subscription } from '../../../core/models/subscription.model';

@Component({
  selector: 'app-subscription-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="subscription-modal-wrapper">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <span class="header-badge">Membresía</span>
          <h2 mat-dialog-title class="dialog-title">Elige tu Suscripción</h2>
          <p class="dialog-subtitle">
            Accede a estadísticas avanzadas, reportes históricos y cobertura exclusiva en eldugoutve.com.
          </p>
        </div>
        <button
          mat-icon-button
          type="button"
          aria-label="Close dialog"
          class="close-btn"
          (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content-scroll custom-scrollbar">
        <form [formGroup]="subscriptionForm" (ngSubmit)="onSubmit()" id="subscriptionForm">
          <!-- 1. Plan Selection Section -->
          <section class="form-section">
            <h3 class="section-title">
              <mat-icon class="section-icon">workspace_premium</mat-icon>
              1. Plan Selection
            </h3>

            <div class="tier-cards-grid">
              <!-- Free Plan Card -->
              <div
                class="tier-card"
                [class.selected]="subscriptionForm.controls.plan.value === 'free'"
                (click)="selectPlan('free')">
                <div class="tier-card-header">
                  <span class="tier-name">Free Plan</span>
                  <div class="radio-indicator">
                    <span class="radio-dot"></span>
                  </div>
                </div>
                <div class="tier-price">
                  <span class="currency">$</span>
                  <span class="amount">0</span>
                  <span class="period">/ forever</span>
                </div>
                <p class="tier-desc">Core frontend template, local PostgreSQL & sample NestJS REST APIs.</p>
                <ul class="tier-features">
                  <li><mat-icon class="feature-icon">check</mat-icon> Angular Standalone Architecture</li>
                  <li><mat-icon class="feature-icon">check</mat-icon> Local Docker PostgreSQL</li>
                  <li><mat-icon class="feature-icon">check</mat-icon> Community Support</li>
                </ul>
              </div>

              <!-- Premium Plan Card -->
              <div
                class="tier-card"
                [class.selected]="subscriptionForm.controls.plan.value === 'premium'"
                (click)="selectPlan('premium')">
                <div class="tier-badge">Recommended</div>
                <div class="tier-card-header">
                  <span class="tier-name">Premium Plan</span>
                  <div class="radio-indicator">
                    <span class="radio-dot"></span>
                  </div>
                </div>
                <div class="tier-price">
                  <span class="currency">$</span>
                  <span class="amount">{{ subscriptionForm.controls.billingPeriod.value === 'annual' ? '15' : '19' }}</span>
                  <span class="period">/ month</span>
                </div>
                <p class="tier-desc">Full Google Cloud Run deployment, Cloud SQL auth, and live telemetry.</p>
                <ul class="tier-features">
                  <li><mat-icon class="feature-icon">check</mat-icon> GCP Cloud Run CI/CD Pipelines</li>
                  <li><mat-icon class="feature-icon">check</mat-icon> Cloud SQL Auth Socket Ready</li>
                  <li><mat-icon class="feature-icon">check</mat-icon> Terminus Health Diagnostics</li>
                  <li><mat-icon class="feature-icon">check</mat-icon> 24/7 Priority SLA & Telemetry</li>
                </ul>
              </div>
            </div>
          </section>

          <!-- 2. Billing Period Section (Only active when Premium is selected) -->
          @if (subscriptionForm.controls.plan.value === 'premium') {
            <section class="form-section">
              <h3 class="section-title">
                <mat-icon class="section-icon">calendar_month</mat-icon>
                2. Billing Frequency
              </h3>

              <div class="billing-cards-grid">
                <!-- Monthly Billing -->
                <div
                  class="billing-card"
                  [class.selected]="subscriptionForm.controls.billingPeriod.value === 'monthly'"
                  (click)="selectBillingPeriod('monthly')">
                  <div class="billing-header">
                    <span class="billing-title">Monthly Billing</span>
                    <span class="radio-dot"></span>
                  </div>
                  <div class="billing-rate">$19 / month</div>
                  <p class="billing-subtitle">Billed monthly. Cancel anytime with no penalties.</p>
                </div>

                <!-- Annual Billing -->
                <div
                  class="billing-card"
                  [class.selected]="subscriptionForm.controls.billingPeriod.value === 'annual'"
                  (click)="selectBillingPeriod('annual')">
                  <span class="discount-pill">Save 20%</span>
                  <div class="billing-header">
                    <span class="billing-title">Annual Billing</span>
                    <span class="radio-dot"></span>
                  </div>
                  <div class="billing-rate">$15 / month</div>
                  <p class="billing-subtitle">Billed annually ($180/year). Includes 2 months free.</p>
                </div>
              </div>
            </section>
          }

          <!-- 3. Legal Disclosure Section -->
          <section class="form-section legal-section">
            <h3 class="section-title">
              <mat-icon class="section-icon">gavel</mat-icon>
              3. Terms & Disclosures
            </h3>

            <div class="checkbox-container">
              <mat-checkbox
                formControlName="renewalConsent"
                color="primary"
                class="renewal-checkbox">
                <span class="checkbox-label">
                  Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
                </span>
              </mat-checkbox>
            </div>

            <div class="legal-links">
              <span>By subscribing, you agree to our</span>
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                class="legal-link">
                Terms of Service
              </a>
              <span>and</span>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                class="legal-link">
                Privacy Policy
              </a>.
            </div>
          </section>
        </form>
      </mat-dialog-content>

      <!-- Error Feedback Banner -->
      @if (errorMessage()) {
        <div class="error-banner">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      <!-- 5. Modal CTA Actions -->
      <mat-dialog-actions class="modal-actions">
        <button
          mat-button
          type="button"
          class="cancel-btn"
          (click)="onCancel()">
          Cancel
        </button>

        <button
          mat-flat-button
          type="submit"
          form="subscriptionForm"
          class="submit-cta-btn"
          [disabled]="subscriptionForm.invalid || isSubmitting()">
          @if (isSubmitting()) {
            <span>Processing...</span>
          } @else if (subscriptionForm.controls.plan.value === 'free') {
            <span>Activate Free Plan</span>
          } @else {
            <span>Start 7-Day Free Trial</span>
          }
          <mat-icon class="btn-arrow">arrow_forward</mat-icon>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    :host { display: block; color: var(--text-color); }
    .subscription-modal-wrapper { display: flex; flex-direction: column; max-height: 90vh; background-color: var(--background-primary-color); border-radius: var(--radius-lg); overflow: hidden; }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 1.75rem 2rem 1.25rem; border-bottom: 1px solid var(--border-subtle); position: sticky; top: 0; background-color: var(--background-primary-color); z-index: 10; }
    .header-badge { display: inline-block; font-size: var(--font-size-xs); font-weight: var(--font-weight-bold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--ice-blue); background: var(--primary-light); padding: 0.25rem 0.65rem; border-radius: var(--radius-pill); margin-bottom: 0.5rem; }
    .dialog-title { font-family: var(--font-display); font-size: var(--font-size-2xl) !important; font-weight: var(--font-weight-extrabold) !important; letter-spacing: -0.02em; color: var(--text-color) !important; margin: 0 0 0.4rem !important; padding: 0 !important; }
    .dialog-subtitle { font-family: var(--font-sans); font-size: var(--font-size-sm); color: var(--text-secondary-color); margin: 0; line-height: 1.5; }
    .close-btn { color: var(--text-muted-color) !important; transition: color 0.2s, transform 0.2s !important; &:hover { color: var(--text-color) !important; transform: scale(1.05); } }
    .modal-content-scroll { padding: 1.75rem 2rem !important; max-height: 65vh; overflow-y: auto; }
    .form-section { margin-bottom: 2.25rem; &:last-of-type { margin-bottom: 1rem; } }
    .section-title { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display); font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--text-color); margin: 0 0 1.25rem; .section-icon { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; color: var(--ice-blue); } }
    .tier-cards-grid, .billing-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .billing-cards-grid { gap: 1rem; }
    .tier-card, .billing-card { position: relative; background: var(--background-card-color); border: 2px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; cursor: pointer; transition: all 0.2s ease; &:hover { border-color: rgba(56, 189, 248, 0.4); } &.selected { border-color: var(--ice-blue); background: rgba(14, 165, 233, 0.06); } }
    .tier-card { display: flex; flex-direction: column; &:hover { transform: translateY(-2px); } &.selected { box-shadow: var(--shadow-glow); .radio-indicator { border-color: var(--ice-blue); .radio-dot { background-color: var(--ice-blue); opacity: 1; transform: scale(1); } } } }
    .tier-badge { position: absolute; top: -0.75rem; right: 1.25rem; background: linear-gradient(135deg, var(--primary-hover), var(--primary-color)); color: var(--text-inverse); font-size: var(--font-size-xs); font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; padding: 0.2rem 0.65rem; border-radius: var(--radius-pill); box-shadow: 0 2px 8px rgba(56, 189, 248, 0.4); }
    .tier-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .tier-name { font-family: var(--font-display); font-size: var(--font-size-md); font-weight: var(--font-weight-bold); color: var(--text-color); }
    .radio-indicator { width: 1.25rem; height: 1.25rem; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.3); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; .radio-dot { width: 0.6rem; height: 0.6rem; border-radius: 50%; opacity: 0; transform: scale(0.5); transition: all 0.2s ease; } }
    .tier-price { display: flex; align-items: baseline; gap: 0.2rem; margin-bottom: 0.75rem; .currency { font-size: var(--font-size-lg); font-weight: 600; color: var(--ice-blue); } .amount { font-family: var(--font-display); font-size: var(--font-size-3xl); font-weight: 800; color: var(--text-color); } .period { font-size: var(--font-size-sm); color: var(--text-muted-color); } }
    .tier-desc { font-family: var(--font-sans); font-size: var(--font-size-sm); color: var(--text-secondary-color); line-height: 1.4; margin: 0 0 1.25rem; }
    .tier-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem; li { display: flex; align-items: center; gap: 0.5rem; font-size: var(--font-size-xs); color: var(--text-secondary-color); .feature-icon { font-size: 1rem; width: 1rem; height: 1rem; color: var(--ice-blue); } } }
    .billing-card { border-radius: var(--radius-md); padding: 1.15rem; &.selected .radio-dot { background-color: var(--ice-blue); opacity: 1; } .discount-pill { position: absolute; top: -0.6rem; right: 1rem; background: var(--success); color: #ffffff; font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: var(--radius-pill); } .billing-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; .billing-title { font-family: var(--font-display); font-size: var(--font-size-sm); font-weight: 700; color: var(--text-color); } .radio-dot { width: 0.65rem; height: 0.65rem; border-radius: 50%; border: 2px solid var(--ice-blue); opacity: 0.3; transition: all 0.2s ease; } } .billing-rate { font-family: var(--font-display); font-size: var(--font-size-md); font-weight: 800; color: var(--ice-blue); margin-bottom: 0.25rem; } .billing-subtitle { font-size: var(--font-size-xs); color: var(--text-muted-color); margin: 0; line-height: 1.35; } }
    .legal-section { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; .section-title { margin-bottom: 0.75rem; } }
    .checkbox-container { margin-bottom: 0.85rem; }
    .checkbox-label { font-size: var(--font-size-sm); line-height: 1.45; color: var(--text-secondary-color); }
    .legal-links { font-size: var(--font-size-xs); color: var(--text-muted-color); display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; .legal-link { color: var(--ice-blue); text-decoration: underline; text-underline-offset: 2px; transition: color 0.2s; &:hover { color: var(--primary-hover); } } }
    .error-banner { margin: 0 2rem 1rem; padding: 0.75rem 1rem; border-radius: var(--radius-sm); background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--danger); font-size: var(--font-size-sm); display: flex; align-items: center; gap: 0.5rem; .error-icon { color: var(--danger); font-size: 1.1rem; width: 1.1rem; height: 1.1rem; } }
    .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 2rem !important; border-top: 1px solid var(--border-subtle); background-color: var(--background-primary-color); }
    .cancel-btn { color: var(--text-muted-color) !important; font-weight: 600 !important; &:hover { color: var(--text-color) !important; } }
    .submit-cta-btn { border-radius: var(--radius-pill) !important; height: 3rem !important; padding: 0 1.75rem !important; font-size: var(--font-size-sm) !important; font-weight: 700 !important; background: linear-gradient(135deg, var(--primary-hover) 0%, var(--primary-color) 100%) !important; color: #ffffff !important; display: inline-flex !important; align-items: center !important; gap: 0.5rem !important; box-shadow: 0 4px 14px rgba(56, 189, 248, 0.4) !important; transition: all 0.2s ease !important; &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--shadow-glow) !important; } &:disabled { opacity: 0.5 !important; cursor: not-allowed !important; } .btn-arrow { font-size: 1.2rem; width: 1.2rem; height: 1.2rem; } }
    @media (max-width: 680px) { .tier-cards-grid, .billing-cards-grid { grid-template-columns: 1fr !important; } .modal-header, .modal-content-scroll, .modal-actions { padding-left: 1.25rem !important; padding-right: 1.25rem !important; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SubscriptionDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly subscriptionsService = inject(SubscriptionsService);

  readonly isSubmitting = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly subscriptionForm = this.fb.group({
    plan: ['premium' as 'free' | 'premium', [Validators.required]],
    billingPeriod: ['monthly' as 'monthly' | 'annual', [Validators.required]],
    renewalConsent: [true, [Validators.requiredTrue]],
  });

  selectPlan(plan: 'free' | 'premium'): void {
    this.subscriptionForm.controls.plan.setValue(plan);
    if (plan === 'free') {
      this.subscriptionForm.controls.renewalConsent.clearValidators();
    } else {
      this.subscriptionForm.controls.renewalConsent.setValidators([Validators.requiredTrue]);
    }
    this.subscriptionForm.controls.renewalConsent.updateValueAndValidity();
  }

  selectBillingPeriod(period: 'monthly' | 'annual'): void {
    this.subscriptionForm.controls.billingPeriod.setValue(period);
  }

  onSubmit(): void {
    if (this.subscriptionForm.invalid) {
      this.subscriptionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const formValue = this.subscriptionForm.getRawValue();

    const payload: CreateSubscriptionInput = {
      plan: formValue.plan || 'premium',
      billingPeriod: formValue.billingPeriod || 'monthly',
      renewalConsent: formValue.renewalConsent ?? true,
      termsAccepted: true,
    };

    this.subscriptionsService.createSubscription(payload).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.dialogRef.close(created);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const backendMessage = Array.isArray(err?.error?.message)
          ? err.error.message.join(', ')
          : err?.error?.message;
        this.errorMessage.set(backendMessage || 'Failed to submit subscription. Please try again.');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
