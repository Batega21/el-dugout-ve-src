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
  templateUrl: './sign-up-dialog.component.html',
  styleUrl: './sign-up-dialog.component.scss',
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
