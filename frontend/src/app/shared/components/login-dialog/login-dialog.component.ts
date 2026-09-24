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
  MatDialog,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { SignUpDialogComponent } from '../sign-up-dialog/sign-up-dialog.component';

@Component({
  selector: 'app-login-dialog',
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
    <div class="login-modal-wrapper">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <span class="header-badge">{{ 'AUTH.LOGIN_BADGE' | translate }}</span>
          <h2 mat-dialog-title class="dialog-title">{{ 'AUTH.LOGIN_TITLE' | translate }}</h2>
          <p class="dialog-subtitle">
            {{ 'AUTH.LOGIN_SUBTITLE' | translate }}
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

        <!-- Reset Password Banner -->
        @if (resetPasswordSent()) {
          <div class="alert-banner alert-success">
            <mat-icon class="alert-icon">check_circle_outline</mat-icon>
            <span>{{ 'AUTH.RESET_SENT' | translate }}</span>
          </div>
        }

        <!-- User Email & Password Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" id="loginForm">
          <!-- 1. Email Input -->
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>{{ 'AUTH.EMAIL' | translate }}</mat-label>
            <input
              matInput
              type="email"
              formControlName="email"
              placeholder="admin@example.com"
              autocomplete="email"
              required />
            <mat-icon matSuffix class="field-icon">email</mat-icon>
            @if (loginForm.controls.email.hasError('required') && loginForm.controls.email.touched) {
              <mat-error>{{ 'AUTH.EMAIL_REQUIRED' | translate }}</mat-error>
            }
            @if (loginForm.controls.email.hasError('email') && loginForm.controls.email.touched) {
              <mat-error>{{ 'AUTH.EMAIL_INVALID' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- 2. Password Input with Show/Hide Toggle -->
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>{{ 'AUTH.PASSWORD' | translate }}</mat-label>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
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
            @if (loginForm.controls.password.hasError('required') && loginForm.controls.password.touched) {
              <mat-error>{{ 'AUTH.PASSWORD_REQUIRED' | translate }}</mat-error>
            }
          </mat-form-field>

          <!-- 3. Forgot Password Link -->
          <div class="form-aux-row">
            <button
              type="button"
              class="forgot-password-link"
              (click)="onForgotPassword()">
              {{ 'AUTH.FORGOT_PASSWORD' | translate }}
            </button>
          </div>

          <!-- Submit CTA Button -->
          <button
            mat-flat-button
            type="submit"
            class="submit-cta-btn"
            [disabled]="loginForm.invalid || isLoading()">
            @if (isLoading()) {
              <span>{{ 'AUTH.SIGNING_IN' | translate }}</span>
            } @else {
              <span>{{ 'AUTH.SIGN_IN_BTN' | translate }}</span>
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

        <!-- Sign-up Option Link -->
        <div class="signup-footer-row">
          <span class="signup-prompt">{{ 'AUTH.NO_ACCOUNT' | translate }}</span>
          <button
            type="button"
            class="signup-link-btn"
            (click)="onSignUpClick()">
            {{ 'AUTH.SIGN_UP_NOW' | translate }}
          </button>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: var(--text-primary, #ffffff);
    }

    .login-modal-wrapper {
      display: flex;
      flex-direction: column;
      max-height: 90vh;
      background-color: var(--background-secondary-color, var(--bg-card));
      border: 1px solid var(--border-theme-color, var(--border-color));
      border-radius: var(--radius-lg, 1.25rem);
      box-shadow: var(--shadow-card);
      overflow: hidden;
      color: var(--text-primary);
    }

    /* Modal Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.75rem 2rem 1rem 2rem;
      border-bottom: 1px solid var(--border-theme-color, var(--border-color));
      position: sticky;
      top: 0;
      background-color: var(--background-secondary-color, var(--bg-card));
      z-index: 10;
    }

    .header-badge {
      display: inline-block;
      font-size: var(--font-size-xs, 0.75rem);
      font-weight: var(--font-weight-bold, 700);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--primary);
      background: var(--primary-light);
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-pill, 9999px);
      margin-bottom: 0.5rem;
    }

    .dialog-title {
      font-family: var(--font-heading, var(--font-display));
      font-size: var(--font-size-2xl, 1.65rem) !important;
      font-weight: var(--font-weight-extrabold, 800) !important;
      letter-spacing: 0.02em;
      color: var(--text-primary) !important;
      margin: 0 0 0.35rem 0 !important;
      padding: 0 !important;
    }

    .dialog-subtitle {
      font-family: var(--font-sans);
      font-size: var(--font-size-sm, 0.875rem);
      color: var(--text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .close-btn {
      color: var(--text-secondary) !important;
      transition: color 0.2s ease, transform 0.2s ease !important;

      &:hover {
        color: var(--text-primary) !important;
        transform: scale(1.05);
      }
    }

    /* Modal Content */
    .modal-content {
      padding: 1.75rem 2rem 2rem 2rem !important;
      max-height: 70vh;
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
      color: var(--danger);
    }

    .alert-success {
      background-color: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--success);
    }

    /* Form Fields */
    .form-field {
      width: 100%;
      margin-bottom: 0.5rem;

      --mdc-outlined-text-field-input-text-color: var(--text-primary);
      --mdc-outlined-text-field-input-text-placeholder-color: var(--text-muted);
      --mdc-outlined-text-field-label-text-color: var(--text-secondary);
      --mdc-outlined-text-field-focus-label-text-color: var(--primary);
      --mdc-outlined-text-field-outline-color: var(--border-color);
      --mdc-outlined-text-field-focus-outline-color: var(--primary);
      --mdc-outlined-text-field-hover-outline-color: var(--border-strong);
      --mdc-outlined-text-field-error-outline-color: var(--danger);
      --mdc-outlined-text-field-error-focus-outline-color: var(--danger);
      --mdc-outlined-text-field-error-hover-outline-color: var(--danger);
      --mdc-outlined-text-field-error-label-text-color: var(--danger);

      input {
        color: var(--text-primary) !important;
        caret-color: var(--primary) !important;
        font-size: 0.95rem;

        &::placeholder {
          color: var(--text-muted) !important;
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
        color: var(--text-secondary);
      }

      mat-error {
        color: var(--danger) !important;
        font-size: 0.8rem;
      }

      .toggle-password-btn {
        width: 2.25rem;
        height: 2.25rem;
        padding: 0;
        color: var(--text-secondary);

        &:hover {
          color: var(--text-primary);
        }
      }
    }

    .full-width {
      width: 100%;
    }

    .form-aux-row {
      display: flex;
      justify-content: flex-end;
      margin: -0.25rem 0 1.25rem 0;
    }

    .forgot-password-link {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.825rem;
      color: var(--primary);
      cursor: pointer;
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 2px;
      transition: color 0.2s ease;

      &:hover {
        color: var(--primary-hover);
      }
    }

    /* Submit CTA Button */
    .submit-cta-btn {
      width: 100%;
      border-radius: 9999px !important;
      height: 3rem !important;
      font-size: 0.95rem !important;
      font-weight: 700 !important;
      background: var(--primary) !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0.5rem !important;
      box-shadow: 0 4px 14px var(--primary-glow, rgba(239, 68, 68, 0.4)) !important;
      transition: all 0.2s ease !important;
      margin-bottom: 1.5rem;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        background: var(--primary-hover) !important;
        box-shadow: 0 6px 20px var(--primary-glow, rgba(239, 68, 68, 0.6)) !important;
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
        background-color: var(--border-theme-color, var(--border-color));
      }

      .divider-text {
        padding: 0 1rem;
        font-size: 0.8rem;
        color: var(--text-muted);
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
      border-color: var(--border-theme-color, var(--border-color)) !important;
      color: var(--text-primary) !important;
      font-size: 0.85rem !important;
      font-weight: 500 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0.5rem !important;
      background-color: var(--background-tertiary-color, var(--bg-card-hover)) !important;
      transition: all 0.2s ease !important;

      &:hover {
        background-color: var(--background-hover-color, var(--bg-card-hover)) !important;
        border-color: var(--primary) !important;
        color: var(--primary) !important;
      }
    }

    /* Sign-up Option Link Footer */
    .signup-footer-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-theme-color, var(--border-color));

      .signup-prompt {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .signup-link-btn {
        background: none;
        border: none;
        padding: 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--primary);
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 2px;
        transition: color 0.2s ease;

        &:hover {
          color: var(--primary-hover);
        }
      }
    }

    @media (max-width: 580px) {
      .modal-header,
      .modal-content {
        padding-left: 1.25rem !important;
        padding-right: 1.25rem !important;
      }

      .social-login-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<LoginDialogComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  readonly hidePassword = signal<boolean>(true);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly resetPasswordSent = signal<boolean>(false);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  togglePasswordVisibility(): void {
    this.hidePassword.update((hide) => !hide);
  }

  onForgotPassword(): void {
    this.resetPasswordSent.set(true);
    this.errorMessage.set(null);
  }

  onSocialLogin(provider: string): void {
    this.authService.setMockUser({
      id: `${provider.toLowerCase()}-user-id`,
      email: `${provider.toLowerCase()}-user@example.com`,
      firstName: provider,
      lastName: 'User',
      name: `${provider} Authenticated User`,
      role: 'USER',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    this.dialogRef.close({ provider, success: true });
  }

  onSignUpClick(): void {
    // Closes the login dialog and opens the sign-up dialog
    this.dialogRef.close('open_signup');
    this.dialog.open(SignUpDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'signup-dialog-panel',
      autoFocus: false,
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.dialogRef.close(res);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Invalid email or password. Please try again.'
        );
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
