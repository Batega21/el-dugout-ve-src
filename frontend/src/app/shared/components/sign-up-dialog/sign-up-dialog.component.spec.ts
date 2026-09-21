import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { SignUpDialogComponent } from './sign-up-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

describe('SignUpDialogComponent', () => {
  let component: SignUpDialogComponent;
  let dialogRefMock: { close: ReturnType<typeof vi.fn> };
  let dialogMock: { open: ReturnType<typeof vi.fn> };
  let authService: AuthService;
  let mockHttpClient: { post: any };

  beforeEach(() => {
    dialogRefMock = {
      close: vi.fn(),
    };
    dialogMock = {
      open: vi.fn(),
    };
    mockHttpClient = {
      post: vi.fn(),
    };

    const injector = Injector.create({
      providers: [
        FormBuilder,
        AuthService,
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    });

    authService = injector.get(AuthService);
    component = runInInjectionContext(injector, () => new SignUpDialogComponent());
  });

  it('should initialize with an invalid form when fields are empty', () => {
    expect(component.signUpForm.invalid).toBe(true);
    expect(component.hidePassword()).toBe(true);
    expect(component.hideConfirmPassword()).toBe(true);
  });

  it('should toggle password visibility when togglePasswordVisibility is called', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(true);
  });

  it('should toggle confirm password visibility when toggleConfirmPasswordVisibility is called', () => {
    expect(component.hideConfirmPassword()).toBe(true);
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword()).toBe(false);
    component.toggleConfirmPasswordVisibility();
    expect(component.hideConfirmPassword()).toBe(true);
  });

  it('should validate that password and confirm password match', () => {
    component.signUpForm.patchValue({
      password: 'Password123!',
      confirmPassword: 'DifferentPassword!',
    });
    expect(component.signUpForm.hasError('passwordMismatch')).toBe(true);

    component.signUpForm.patchValue({
      confirmPassword: 'Password123!',
    });
    expect(component.signUpForm.hasError('passwordMismatch')).toBe(false);
  });

  it('should mark confirmPassword in error state when passwords mismatch and control is dirty or touched', () => {
    component.signUpForm.patchValue({
      password: 'Password123!',
      confirmPassword: 'DifferentPassword!',
    });
    const confirmControl = component.signUpForm.controls.confirmPassword;
    expect(component.confirmPasswordMatcher.isErrorState(confirmControl, null)).toBe(false);

    confirmControl.markAsDirty();
    expect(component.confirmPasswordMatcher.isErrorState(confirmControl, null)).toBe(true);

    confirmControl.setValue('Password123!');
    expect(component.confirmPasswordMatcher.isErrorState(confirmControl, null)).toBe(false);
  });

  it('should only accept numbers and dashes in mobile control', () => {
    component.signUpForm.controls.mobileNumber.setValue('555-019-2831');
    expect(component.signUpForm.controls.mobileNumber.valid).toBe(true);

    component.signUpForm.controls.mobileNumber.setValue('555-abc-2831');
    expect(component.signUpForm.controls.mobileNumber.valid).toBe(false);

    component.signUpForm.controls.mobileNumber.setValue('+1 (555) 019-2831');
    expect(component.signUpForm.controls.mobileNumber.valid).toBe(false);
  });

  it('should block non-numeric, non-dash keys on onMobileKeyDown', () => {
    const preventDefaultSpy = vi.fn();
    const invalidEvent = {
      key: 'x',
      ctrlKey: false,
      metaKey: false,
      preventDefault: preventDefaultSpy,
    } as unknown as KeyboardEvent;

    component.onMobileKeyDown(invalidEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    const validDigitSpy = vi.fn();
    const digitEvent = {
      key: '9',
      ctrlKey: false,
      metaKey: false,
      preventDefault: validDigitSpy,
    } as unknown as KeyboardEvent;

    component.onMobileKeyDown(digitEvent);
    expect(validDigitSpy).not.toHaveBeenCalled();

    const validDashSpy = vi.fn();
    const dashEvent = {
      key: '-',
      ctrlKey: false,
      metaKey: false,
      preventDefault: validDashSpy,
    } as unknown as KeyboardEvent;

    component.onMobileKeyDown(dashEvent);
    expect(validDashSpy).not.toHaveBeenCalled();
  });

  it('should sanitize pasted input to only numbers and dashes on onMobileInput', () => {
    const mockInput = { value: '+1 (555) 019-2831 ext' } as HTMLInputElement;
    const event = { target: mockInput } as unknown as Event;

    component.onMobileInput(event);
    expect(mockInput.value).toBe('1555019-2831');
  });

  it('should set mock user and close dialog on social login', () => {
    const spy = vi.spyOn(authService, 'setMockUser');

    component.onSocialLogin('Google');

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'google-user@example.com',
        role: 'USER',
      })
    );
    expect(dialogRefMock.close).toHaveBeenCalledWith({
      provider: 'Google',
      success: true,
    });
  });

  it('should close sign-up dialog and open LoginDialogComponent on onLoginClick', () => {
    component.onLoginClick();
    expect(dialogRefMock.close).toHaveBeenCalledWith('open_login');
    expect(dialogMock.open).toHaveBeenCalledWith(
      LoginDialogComponent,
      expect.objectContaining({
        width: '520px',
      })
    );
  });

  it('should call authService.register and close on successful submission', () => {
    const mockAuthResponse = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'USER' as const,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    };

    vi.spyOn(authService, 'register').mockReturnValue(of(mockAuthResponse));

    component.signUpForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      mobileNumber: '555-123-4567',
    });

    expect(component.signUpForm.valid).toBe(true);
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'Password123!',
      mobileNumber: '555-123-4567',
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockAuthResponse);
  });

  it('should display error message when authService.register fails', () => {
    vi.spyOn(authService, 'register').mockReturnValue(
      throwError(() => ({ error: { message: 'Email already registered' } }))
    );

    component.signUpForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'duplicate@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      mobileNumber: '',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Email already registered');
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
