import '@angular/compiler';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let injector: Injector;

  let mockAuthService: {
    currentUser: ReturnType<typeof signal<User | null>>;
    updateProfile: any;
  };

  const initialUser: User = {
    id: 'user-profile-1',
    email: 'sarah.connor@example.com',
    firstName: 'Sarah',
    lastName: 'Connor',
    mobileNumber: '+1 555-0199',
    avatarUrl: 'https://images.example.com/sarah.jpg',
    role: 'USER',
    tier: 'FREE',
    twoFactorEnabled: false,
    isActive: true,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(() => {
    mockAuthService = {
      currentUser: signal<User | null>(initialUser),
      updateProfile: vi.fn().mockReturnValue(of(initialUser)),
    };

    injector = Injector.create({
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    component = runInInjectionContext(injector, () => new ProfileComponent());
    component.ngOnInit();
  });

  it('should create the profile component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.profileForm.get('firstName')?.value).toBe('Sarah');
    expect(component.profileForm.get('lastName')?.value).toBe('Connor');
    expect(component.profileForm.get('mobileNumber')?.value).toBe('+1 555-0199');
    expect(component.profileForm.get('avatarUrl')?.value).toBe('https://images.example.com/sarah.jpg');
    expect(component.profileForm.get('twoFactorEnabled')?.value).toBe(false);
  });

  it('should compute avatarPreviewUrl from form avatarUrl', () => {
    expect(component.avatarPreviewUrl()).toBe('https://images.example.com/sarah.jpg');

    component.profileForm.patchValue({ avatarUrl: 'https://new-image.com/pic.png' });
    expect(component.avatarPreviewUrl()).toBe('https://new-image.com/pic.png');
  });

  it('should reset avatarUrl to empty on removeAvatar()', () => {
    component.removeAvatar();
    expect(component.profileForm.get('avatarUrl')?.value).toBe('');
    expect(component.avatarPreviewUrl()).toBeNull();
  });

  it('should fall back to null avatarPreviewUrl when onAvatarImgError() is called', () => {
    expect(component.avatarPreviewUrl()).toBe('https://images.example.com/sarah.jpg');
    component.onAvatarImgError();
    expect(component.avatarPreviewUrl()).toBeNull();
  });

  it('should detect password mismatch when newPassword does not match confirmPassword', () => {
    expect(component.passwordMismatch()).toBe(false);

    component.profileForm.patchValue({
      newPassword: 'password123',
      confirmPassword: 'differentPassword',
    });
    expect(component.passwordMismatch()).toBe(true);

    component.profileForm.patchValue({
      confirmPassword: 'password123',
    });
    expect(component.passwordMismatch()).toBe(false);
  });

  it('should call updateProfile on valid submission and display success message', () => {
    component.profileForm.patchValue({
      firstName: 'Sarah Jane',
      lastName: 'Connor-Reese',
      twoFactorEnabled: true,
    });

    component.onSubmit();

    expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Sarah Jane',
        lastName: 'Connor-Reese',
        twoFactorEnabled: true,
      })
    );
    expect(component.successMessage()).toBe('Profile updated successfully!');
    expect(component.isSaving()).toBe(false);
  });

  it('should display error message if updateProfile fails', () => {
    mockAuthService.updateProfile.mockReturnValue(
      throwError(() => ({
        error: { message: 'The current password provided is incorrect.' },
      }))
    );

    component.profileForm.patchValue({
      currentPassword: 'wrongPassword',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('The current password provided is incorrect.');
    expect(component.isSaving()).toBe(false);
  });
});
