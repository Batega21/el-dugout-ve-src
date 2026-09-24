import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { UpdateProfileInput } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  profileForm!: FormGroup;

  readonly isSaving = signal<boolean>(false);
  readonly successMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly showCurrentPassword = signal<boolean>(false);
  readonly showNewPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  private readonly avatarImgError = signal<boolean>(false);
  readonly currentAvatarUrl = signal<string>('');
  readonly newPasswordSignal = signal<string>('');
  readonly confirmPasswordSignal = signal<string>('');

  readonly avatarPreviewUrl = computed(() => {
    if (this.avatarImgError()) return null;
    const formVal = this.currentAvatarUrl();
    return formVal && formVal.trim().length > 0 ? formVal.trim() : null;
  });

  readonly passwordMismatch = computed(() => {
    const newPass = this.newPasswordSignal();
    const confirmPass = this.confirmPasswordSignal();
    if (newPass && confirmPass) {
      return newPass !== confirmPass;
    }
    return false;
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    const initialAvatar = user?.avatarUrl || '';
    this.currentAvatarUrl.set(initialAvatar);

    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      mobileNumber: [user?.mobileNumber || ''],
      avatarUrl: [initialAvatar],
      twoFactorEnabled: [user?.twoFactorEnabled || false],
      currentPassword: [''],
      newPassword: ['', [Validators.minLength(8)]],
      confirmPassword: [''],
    });

    this.profileForm.get('avatarUrl')?.valueChanges.subscribe((val) => {
      this.currentAvatarUrl.set(val || '');
      this.avatarImgError.set(false);
    });

    this.profileForm.get('newPassword')?.valueChanges.subscribe((val) => {
      this.newPasswordSignal.set(val || '');
    });

    this.profileForm.get('confirmPassword')?.valueChanges.subscribe((val) => {
      this.confirmPasswordSignal.set(val || '');
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64Url = reader.result as string;
        this.profileForm.patchValue({ avatarUrl: base64Url });
        this.currentAvatarUrl.set(base64Url);
        this.avatarImgError.set(false);
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar(): void {
    this.profileForm.patchValue({ avatarUrl: '' });
    this.currentAvatarUrl.set('');
    this.avatarImgError.set(false);
  }

  onAvatarImgError(): void {
    this.avatarImgError.set(true);
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.passwordMismatch()) return;

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formValues = this.profileForm.value;
    const payload: UpdateProfileInput = {
      firstName: formValues.firstName?.trim(),
      lastName: formValues.lastName?.trim(),
      mobileNumber: formValues.mobileNumber?.trim() || null,
      avatarUrl: formValues.avatarUrl?.trim() || null,
      twoFactorEnabled: !!formValues.twoFactorEnabled,
    };

    if (formValues.newPassword) {
      payload.currentPassword = formValues.currentPassword;
      payload.newPassword = formValues.newPassword;
      payload.confirmPassword = formValues.confirmPassword;
    }

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('Profile updated successfully!');
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
      error: (err: any) => {
        this.isSaving.set(false);
        const backendMessage =
          err?.error?.message ||
          err?.message ||
          'Failed to update profile. Please verify your details and try again.';
        this.errorMessage.set(backendMessage);
      },
    });
  }
}
