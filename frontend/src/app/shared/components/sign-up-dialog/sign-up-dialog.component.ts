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
  AbstractControl,
  ValidationErrors,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateMatcher } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

export class ConfirmPasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = !!(form && form.submitted);
    const controlDirtyOrTouched = !!(control && (control.dirty || control.touched));
    const controlInvalid = !!(control && control.invalid);
    const parentMismatch = !!(
      (control?.parent && control.parent.hasError('passwordMismatch')) ||
      (form && form.hasError('passwordMismatch'))
    );
    return (controlInvalid || (parentMismatch && controlDirtyOrTouched)) || (isSubmitted && (controlInvalid || parentMismatch));
  }
}

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-sign-up-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  template: `
    <div class="signup-modal-wrapper">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <span class="header-badge">{{ 'AUTH.SIGNUP_BADGE' | translate }}</span>
          <h2 mat-dialog-title class="dialog-title">{{ 'AUTH.SIGNUP_TITLE' | translate }}</h2>
          <p class="dialog-subtitle">
            {{ 'AUTH.SIGNUP_SUBTITLE' | translate }}
          </p>
        </div>
        <button
          mat-icon-button
          type="button"
          [attr.aria-label]="'COMMON.ACTIONS.CLOSE' | translate"
          class="close-btn"
          (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="modal-content custom-scrollbar">
        <!-- Error Alert Banner -->
        @if (errorMessage()) {
          <div class="alert-banner alert-danger">
            <mat-icon class="alert-icon">error_outline</mat-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <!-- Sign Up Form -->
        <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()" id="signUpForm">
          <!-- First and Last Name Inputs -->
          <div class="names-row">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>{{ 'AUTH.FIRST_NAME' | translate }}</mat-label>
              <input
                matInput
                type="text"
                formControlName="firstName"
                placeholder="John"
                autocomplete="given-name"
                required />
              <mat-icon matSuffix class="field-icon">person</mat-icon>
              @if (signUpForm.controls.firstName.hasError('required') && signUpForm.controls.firstName.touched) {
                <mat-error>{{ 'AUTH.FIRST_NAME_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>{{ 'AUTH.LAST_NAME' | translate }}</mat-label>
              <input
                matInput
                type="text"
                formControlName="lastName"
                placeholder="Doe"
                autocomplete="family-name"
                required />
              <mat-icon matSuffix class="field-icon">person_outline</mat-icon>
              @if (signUpForm.controls.lastName.hasError('required') && signUpForm.controls.lastName.touched) {
                <mat-error>{{ 'AUTH.LAST_NAME_REQUIRED' | translate }}</mat-error>
              }
            </mat-form-field>
          </div>

          <!-- Email Input -->
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              placeholder="user@example.com"
              autocomplete="email"
              required />
            <mat-icon matSuffix class="field-icon">email</mat-icon>
            @if (signUpForm.controls.email.hasError('required') && signUpForm.controls.email.touched) {
              <mat-error>{{ 'AUTH.EMAIL_REQUIRED' | translate }}</mat-error>
            }
            @if (signUpForm.controls.email.hasError('email') && signUpForm.controls.email.touched) {
              <mat-error>{{ 'AUTH.EMAIL_INVALID' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- Password Input with Show/Hide Toggle -->
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>{{ 'AUTH.PASSWORD' | translate }}</mat-label>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              [placeholder]="'AUTH.PASSWORD_MIN_SIGNUP' | translate"
              autocomplete="new-password"
              required />
            <button
              mat-icon-button
              matSuffix
              type="button"
              class="toggle-password-btn"
              (click)="togglePasswordVisibility()"
              [attr.aria-label]="(hidePassword() ? 'AUTH.PASSWORD_SHOW' : 'AUTH.PASSWORD_HIDE') | translate"
              [attr.aria-pressed]="!hidePassword()">
              <mat-icon class="field-icon">
                {{ hidePassword() ? 'visibility_off' : 'visibility' }}
              </mat-icon>
            </button>
            @if (signUpForm.controls.password.hasError('required') && signUpForm.controls.password.touched) {
              <mat-error>{{ 'AUTH.PASSWORD_REQUIRED' | translate }}</mat-error>
            }
            @if (signUpForm.controls.password.hasError('minlength') && signUpForm.controls.password.touched) {
              <mat-error>{{ 'AUTH.PASSWORD_MIN_SIGNUP' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- Confirm Password Input with Show/Hide Toggle -->
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</mat-label>
            <input
              matInput
              [type]="hideConfirmPassword() ? 'password' : 'text'"
              formControlName="confirmPassword"
              [errorStateMatcher]="confirmPasswordMatcher"
              placeholder="••••••••"
              autocomplete="new-password"
              required />
            <button
              mat-icon-button
              matSuffix
              type="button"
              class="toggle-password-btn"
              (click)="toggleConfirmPasswordVisibility()"
              [attr.aria-label]="(hideConfirmPassword() ? 'AUTH.PASSWORD_SHOW' : 'AUTH.PASSWORD_HIDE') | translate"
              [attr.aria-pressed]="!hideConfirmPassword()">
              <mat-icon class="field-icon">
                {{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}
              </mat-icon>
            </button>
            @if (signUpForm.controls.confirmPassword.hasError('passwordMismatch') && signUpForm.controls.confirmPassword.touched) {
              <mat-error>{{ 'AUTH.PASSWORDS_DONT_MATCH' | translate }}</mat-error>
            }
            @if (signUpForm.controls.confirmPassword.hasError('required') && signUpForm.controls.confirmPassword.touched) {
              <mat-error>{{ 'AUTH.CONFIRM_PASSWORD_REQUIRED' | translate }}</mat-error>
            }
            @if (signUpForm.hasError('passwordMismatch') && (signUpForm.controls.confirmPassword.dirty || signUpForm.controls.confirmPassword.touched) && !signUpForm.controls.confirmPassword.hasError('required')) {
              <mat-error>{{ 'AUTH.PASSWORDS_DONT_MATCH' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- Mobile Number (Optional, numbers and dashes only) -->
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>{{ 'PROFILE.MOBILE_NUMBER' | translate }}</mat-label>
            <input
              matInput
              type="tel"
              formControlName="mobileNumber"
              placeholder="555-123-4567"
              autocomplete="tel"
              (keydown)="onMobileKeyDown($event)"
              (input)="onMobileInput($event)" />
            <mat-icon matSuffix class="field-icon">phone</mat-icon>
            @if (signUpForm.controls.mobileNumber.hasError('pattern') && signUpForm.controls.mobileNumber.touched) {
              <mat-error>Only numbers and dashes (-) are allowed</mat-error>
            }
          </mat-form-field>

          <!-- Submit CTA Button -->
          <button
            mat-flat-button
            type="submit"
            class="submit-cta-btn"
            [disabled]="signUpForm.invalid || isLoading()">
            @if (isLoading()) {
              <span>{{ 'AUTH.CREATING_ACCOUNT' | translate }}</span>
            } @else {
              <span>{{ 'AUTH.SIGN_UP_BTN' | translate }}</span>
            }
            <mat-icon class="btn-arrow">arrow_forward</mat-icon>
          </button>
        </form>

        <!-- Social Login Divider -->
        <div class="social-divider">
          <span class="divider-line"></span>
          <span class="divider-text">{{ 'AUTH.OR_CONTINUE' | translate }}</span>
          <span class="divider-line"></span>
        </div>

        <!-- Social Login Options -->
        <div class="social-login-grid">
          <button
            type="button"
            mat-stroked-button
            class="social-btn"
            (click)="onSocialLogin('Google')">
            <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            mat-stroked-button
            class="social-btn"
            (click)="onSocialLogin('GitHub')">
            <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            GitHub
          </button>

          <button
            type="button"
            mat-stroked-button
            class="social-btn"
            (click)="onSocialLogin('Apple')">
            <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.88-.93.04-2.02.62-2.66 1.37-.56.65-1.06 1.7-1 2.76 1.04.08 2.03-.53 2.65-1.25z"/>
            </svg>
            Apple
          </button>
        </div>

        <!-- Login Option: Clickable text closing Sign-up and opening Login modal -->
        <div class="login-footer-row">
          <span class="login-prompt">{{ 'AUTH.ALREADY_HAVE_ACCOUNT' | translate }}</span>
          <button
            type="button"
            class="login-link-btn"
            (click)="onLoginClick()">
            {{ 'AUTH.LOG_IN_NOW' | translate }}
          </button>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: var(--text-color, #ffffff);
    }

    .signup-modal-wrapper {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      background-color: var(--background-primary-color, #0b0f19);
      border-radius: var(--radius-lg, 1.25rem);
      overflow: hidden;
    }

    /* Modal Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.75rem 2rem 1rem 2rem;
      border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
      position: sticky;
      top: 0;
      background-color: var(--background-primary-color, #0b0f19);
      z-index: 10;
    }

    .header-badge {
      display: inline-block;
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-bold, 700);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ice-blue, #38bdf8);
      background: var(--primary-light, rgba(56, 189, 248, 0.12));
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-pill, 9999px);
      margin-bottom: 0.5rem;
    }

    .dialog-title {
      font-family: var(--font-display);
      font-size: var(--font-size-2xl, 1.65rem) !important;
      font-weight: var(--font-weight-extrabold, 800) !important;
      letter-spacing: -0.02em;
      color: var(--text-color, #ffffff) !important;
      margin: 0 0 0.35rem 0 !important;
      padding: 0 !important;
    }

    .dialog-subtitle {
      font-family: var(--font-sans);
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--text-secondary-color, #94a3b8);
      margin: 0;
      line-height: 1.5;
    }

    .close-btn {
      color: var(--text-muted-color, #94a3b8) !important;
      transition: color 0.2s ease, transform 0.2s ease !important;

      &:hover {
        color: var(--text-color, #ffffff) !important;
        transform: scale(1.05);
      }
    }

    /* Modal Content */
    .modal-content {
      padding: 1.75rem 2rem 2rem 2rem !important;
      max-height: 75vh;
      overflow-y: auto;
    }

    /* Alerts */
    .alert-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      line-height: 1.4;

      .alert-icon {
        font-size: 1.15rem;
        width: 2.15rem;
        height: 1.15rem;
      }
    }

    .alert-danger {
      background-color: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .names-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* Form Fields */
    .form-field {
      width: 100%;
      margin-bottom: 0.5rem;

      --mdc-outlined-text-field-input-text-color: #f1f5f9;
      --mdc-outlined-text-field-input-text-placeholder-color: #94a3b8;
      --mdc-outlined-text-field-label-text-color: #94a3b8;
      --mdc-outlined-text-field-focus-label-text-color: #38bdf8;
      --mdc-outlined-text-field-outline-color: rgba(255, 255, 255, 0.18);
      --mdc-outlined-text-field-focus-outline-color: #38bdf8;
      --mdc-outlined-text-field-hover-outline-color: rgba(255, 255, 255, 0.35);

      input {
        color: #f1f5f9 !important;
        font-size: 0.95rem;

        &::placeholder {
          color: #94a3b8 !important;
          opacity: 0 !important;
          transition: opacity 0.2s ease;
        }

        &:focus::placeholder {
          opacity: 0.75 !important;
        }
      }

      &:not(.mat-focused) input::placeholder {
        opacity: 0 !important;
      }

      &.mat-focused input::placeholder {
        opacity: 0.75 !important;
      }

      .field-icon {
        color: #94a3b8;
      }

      .toggle-password-btn {
        width: 2.25rem;
        height: 2.25rem;
        padding: 0;
      }
    }

    .full-width {
      width: 100%;
    }

    /* Submit CTA Button */
    .submit-cta-btn {
      width: 100%;
      border-radius: 9999px !important;
      height: 3rem !important;
      font-size: 0.95rem !important;
      font-weight: 700 !important;
      background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%) !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0.5rem !important;
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.4) !important;
      transition: all 0.2s ease !important;
      margin-top: 0.5rem;
      margin-bottom: 1.5rem;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(56, 189, 248, 0.6) !important;
      }

      &:disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }

      .btn-arrow {
        font-size: 1.2rem;
        width: 1.2rem;
        height: 1.2rem;
      }
    }

    /* Social Divider */
    .social-divider {
      display: flex;
      align-items: center;
      margin-bottom: 1.25rem;

      .divider-line {
        flex: 1;
        height: 1px;
        background-color: rgba(255, 255, 255, 0.1);
      }

      .divider-text {
        padding: 0 1rem;
        font-size: 0.8rem;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
      }
    }

    /* Social Login Grid */
    .social-login-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.85rem;
      margin-bottom: 1.75rem;
    }

    .social-btn {
      height: 2.75rem !important;
      border-radius: 0.5rem !important;
      border-color: rgba(255, 255, 255, 0.14) !important;
      color: #cbd5e1 !important;
      font-size: 0.85rem !important;
      font-weight: 500 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0.5rem !important;
      background-color: rgba(255, 255, 255, 0.02) !important;
      transition: all 0.2s ease !important;

      &:hover {
        background-color: rgba(255, 255, 255, 0.08) !important;
        border-color: #38bdf8 !important;
        color: #ffffff !important;
      }
    }

    /* Login Link Footer */
    .login-footer-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);

      .login-prompt {
        font-size: 0.875rem;
        color: #94a3b8;
      }

      .login-link-btn {
        background: none;
        border: none;
        padding: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: #38bdf8;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: color 0.2s ease;

        &:hover {
          color: #7dd3fc;
        }
      }
    }

    @media (max-width: 580px) {
      .modal-header,
      .modal-content {
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
      }

      .names-row,
      .social-login-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SignUpDialogComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly hidePassword = signal<boolean>(true);
  readonly hideConfirmPassword = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly confirmPasswordMatcher = new ConfirmPasswordErrorStateMatcher();

  readonly signUpForm = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      mobileNumber: ['', [Validators.pattern(/^[0-9-]*$/)]],
    },
    { validators: passwordMatchValidator }
  );

  togglePasswordVisibility(): void {
    this.hidePassword.update((hide) => !hide);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((hide) => !hide);
  }

  onMobileKeyDown(event: KeyboardEvent): void {
    const functionalKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End',
      'Enter',
      'Escape',
    ];
    if (functionalKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    // Only allow numerical characters (0-9) and dash (-)
    if (!/^[0-9-]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;

    // Strip any disallowed characters (e.g. from paste)
    const sanitized = input.value.replace(/[^0-9-]/g, '');
    if (sanitized !== input.value) {
      input.value = sanitized;
      this.signUpForm.controls.mobileNumber.setValue(sanitized, { emitEvent: false });
    }
  }

  onSocialLogin(provider: string): void {
    this.authService.setMockUser({
      id: `${provider.toLowerCase()}-user-id`,
      email: `${provider.toLowerCase()}-user@example.com`,
      firstName: 'Social',
      lastName: provider,
      name: `Social ${provider}`,
      role: 'USER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.dialogRef.close({ provider, success: true });
  }

  onLoginClick(): void {
    // Closes this "Sign-up" modal and opens the "Login" modal
    this.dialogRef.close('open_login');
    this.dialog.open(LoginDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      panelClass: 'login-dialog-panel',
      autoFocus: false,
    });
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { firstName, lastName, email, password, mobileNumber } = this.signUpForm.getRawValue();

    this.authService
      .register({
        firstName: firstName!,
        lastName: lastName!,
        email: email!,
        password: password!,
        mobileNumber: mobileNumber?.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.dialogRef.close(res);
        },
        error: (err) => {
          this.isLoading.set(false);
          const backendMessage = Array.isArray(err?.error?.message)
            ? err.error.message.join(', ')
            : err?.error?.message;
          this.errorMessage.set(backendMessage || 'Failed to create account. Please try again.');
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
