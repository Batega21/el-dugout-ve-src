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
import { TranslatePipe } from '@ngx-translate/core';
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
    TranslatePipe,
  ],
  templateUrl: './subscription-dialog.component.html',
  styleUrl: './subscription-dialog.component.scss',
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
