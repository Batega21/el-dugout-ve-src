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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="profile-page">
      <div class="profile-container">
        <!-- Breadcrumb / Header Title -->
        <header class="page-header">
          <a routerLink="/" class="back-link">
            <mat-icon class="back-icon">arrow_back</mat-icon>
            <span>Back to Home</span>
          </a>
          <h1 class="page-title">Account Profile</h1>
          <p class="page-subtitle">Manage your personal information, security credentials, and preferences.</p>
        </header>

        <!-- Feedback Alerts -->
        @if (successMessage()) {
          <div class="alert success" role="alert">
            <mat-icon class="alert-icon">check_circle</mat-icon>
            <span>{{ successMessage() }}</span>
          </div>
        }

        @if (errorMessage()) {
          <div class="alert error" role="alert">
            <mat-icon class="alert-icon">error_outline</mat-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="profile-card">
          <!-- 1. Avatar Section -->
          <section class="section-block avatar-section">
            <h2 class="section-title">Profile Picture</h2>

            <div class="avatar-row">
              <div class="avatar-preview-circle">
                @if (avatarPreviewUrl()) {
                  <img
                    [src]="avatarPreviewUrl()"
                    alt="User Avatar Preview"
                    class="avatar-image"
                    (error)="onAvatarImgError()"
                  />
                } @else {
                  <mat-icon class="fallback-user-icon">person</mat-icon>
                }
              </div>

              <div class="avatar-controls">
                <div class="file-upload-row">
                  <input
                    #fileInput
                    type="file"
                    accept="image/*"
                    class="hidden-file-input"
                    (change)="onFileSelected($event)"
                  />
                  <button
                    mat-flat-button
                    type="button"
                    class="upload-btn"
                    (click)="fileInput.click()">
                    <mat-icon>upload</mat-icon>
                    <span>Upload Image</span>
                  </button>

                  @if (avatarPreviewUrl()) {
                    <button
                      mat-button
                      type="button"
                      color="warn"
                      class="remove-avatar-btn"
                      (click)="removeAvatar()">
                      <mat-icon>delete_outline</mat-icon>
                      <span>Remove</span>
                    </button>
                  }
                </div>

                <mat-form-field appearance="outline" class="avatar-url-field">
                  <mat-label>Or image URL</mat-label>
                  <input
                    matInput
                    formControlName="avatarUrl"
                    placeholder="https://example.com/photo.jpg"
                  />
                </mat-form-field>
              </div>
            </div>
          </section>

          <mat-divider></mat-divider>

          <!-- 2. Personal Information -->
          <section class="section-block">
            <h2 class="section-title">Personal Information</h2>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" placeholder="First Name" />
                @if (profileForm.get('firstName')?.hasError('required')) {
                  <mat-error>First name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" placeholder="Last Name" />
                @if (profileForm.get('lastName')?.hasError('required')) {
                  <mat-error>Last name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email Address</mat-label>
                <input matInput [value]="authService.currentUser()?.email" disabled />
                <mat-hint>Email is managed through authentication</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mobile Number</mat-label>
                <input matInput formControlName="mobileNumber" placeholder="+1 (555) 000-0000" />
              </mat-form-field>
            </div>
          </section>

          <mat-divider></mat-divider>

          <!-- 3. Security & Two-Factor Authentication -->
          <section class="section-block">
            <h2 class="section-title">Two-Factor Authentication (2FA)</h2>
            <div class="two-factor-card">
              <div class="two-factor-info">
                <span class="two-factor-label">Enable Two-Factor Authentication</span>
                <span class="two-factor-desc">
                  Add an extra layer of security to your account during login.
                </span>
              </div>
              <mat-slide-toggle formControlName="twoFactorEnabled" color="primary"></mat-slide-toggle>
            </div>
          </section>

          <mat-divider></mat-divider>

          <!-- 4. Change Password -->
          <section class="section-block">
            <h2 class="section-title">Change Password</h2>
            <p class="section-hint">Leave blank if you do not wish to change your password.</p>

            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Current Password</mat-label>
                <input
                  matInput
                  [type]="showCurrentPassword() ? 'text' : 'password'"
                  formControlName="currentPassword"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="showCurrentPassword.set(!showCurrentPassword())">
                  <mat-icon>{{ showCurrentPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>New Password</mat-label>
                <input
                  matInput
                  [type]="showNewPassword() ? 'text' : 'password'"
                  formControlName="newPassword"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="showNewPassword.set(!showNewPassword())">
                  <mat-icon>{{ showNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (profileForm.get('newPassword')?.hasError('minlength')) {
                  <mat-error>Must be at least 8 characters</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Confirm New Password</mat-label>
                <input
                  matInput
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                />
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="showConfirmPassword.set(!showConfirmPassword())">
                  <mat-icon>{{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </mat-form-field>
            </div>

            @if (passwordMismatch()) {
              <div class="inline-error">
                <mat-icon class="inline-error-icon">warning</mat-icon>
                <span>New password and confirm password do not match.</span>
              </div>
            }
          </section>

          <!-- Submit Action Button -->
          <div class="form-actions">
            <button
              mat-flat-button
              type="submit"
              color="primary"
              class="save-btn"
              [disabled]="isSaving() || profileForm.invalid || passwordMismatch()">
              @if (isSaving()) {
                <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                <span>Saving Changes...</span>
              } @else {
                <span>Save Changes</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: calc(100vh - 4.5rem);
      background-color: var(--background-primary-color, #0b0f19);
      color: var(--text-color, #f9fafb);
      padding: 2.5rem 1rem 4rem;
    }

    .profile-container {
      max-width: 760px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--primary-color, var(--primary, #3b82f6));
      text-decoration: none;
      font-weight: var(--font-weight-medium, 500);
      font-size: var(--font-size-sm, 0.9rem);
      margin-bottom: 0.75rem;
      transition: opacity 0.15s ease;

      &:hover {
        opacity: 0.8;
      }

      .back-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }
    }

    .page-title {
      font-family: var(--font-display);
      font-size: var(--font-size-2xl, 2rem);
      font-weight: var(--font-weight-extrabold, 800);
      letter-spacing: -0.02em;
      margin: 0 0 0.5rem;
      color: var(--text-color, #f9fafb);
    }

    .page-subtitle {
      font-family: var(--font-sans);
      color: var(--text-secondary-color, #9ca3af);
      font-size: var(--font-size-sm, 0.95rem);
      margin: 0;
      line-height: 1.5;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: var(--radius-sm, 6px);
      margin-bottom: 1.5rem;
      font-size: var(--font-size-sm, 0.9rem);
      font-weight: var(--font-weight-medium, 500);

      .alert-icon {
        font-size: 1.3rem;
        width: 1.3rem;
        height: 1.3rem;
      }

      &.success {
        background: rgba(16, 185, 129, 0.15);
        color: var(--success, #34d399);
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.error {
        background: rgba(239, 68, 68, 0.15);
        color: var(--danger, #f87171);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }

    .profile-card {
      background: var(--background-card-color, #111827);
      border: 1px solid var(--border-theme-color, #1f293d);
      border-radius: var(--radius-md, 10px);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.3));
    }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: var(--font-size-md, 1.15rem);
      font-weight: var(--font-weight-bold, 700);
      margin: 0;
      color: var(--text-color, #f9fafb);
    }

    .section-hint {
      font-size: var(--font-size-sm, 0.85rem);
      color: var(--text-muted-color, #6b7280);
      margin: -0.5rem 0 0;
    }

    /* Avatar Row */
    .avatar-row {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      flex-wrap: wrap;
    }

    .avatar-preview-circle {
      width: 5.5rem;
      height: 5.5rem;
      border-radius: 50%;
      overflow: hidden;
      background: var(--bg-card-hover, #1f2937);
      border: 2px solid var(--mat-sys-primary, var(--primary, #3b82f6));
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.3));
      flex-shrink: 0;

      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .fallback-user-icon {
        font-size: 3.25rem;
        width: 3.25rem;
        height: 3.25rem;
        color: var(--text-secondary, #9ca3af);
      }
    }

    .avatar-controls {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
      min-width: 260px;
    }

    .file-upload-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .hidden-file-input {
      display: none;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--mat-sys-primary, var(--primary, #3b82f6));
      color: #ffffff;
    }

    .avatar-url-field {
      width: 100%;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    /* 2FA Card */
    .two-factor-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: var(--bg-card-hover, rgba(255, 255, 255, 0.04));
      border: 1px solid var(--border-color, #1f293d);
      border-radius: var(--radius-sm, 6px);
      gap: 1rem;
    }

    .two-factor-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .two-factor-label {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary, #f9fafb);
    }

    .two-factor-desc {
      font-size: 0.85rem;
      color: var(--text-secondary, #9ca3af);
    }

    .inline-error {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #f87171;
      font-size: 0.85rem;
      font-weight: 500;

      .inline-error-icon {
        font-size: 1.1rem;
        width: 1.1rem;
        height: 1.1rem;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 0.5rem;
    }

    .save-btn {
      min-width: 140px;
      height: 2.75rem;
      font-weight: 600;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-spinner {
      margin-right: 0.5rem;
    }

    @media (max-width: 640px) {
      .profile-card {
        padding: 1.25rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .avatar-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .save-btn {
        width: 100%;
      }
    }
  `],
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
