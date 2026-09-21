import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { LoginDialogComponent } from './login-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { SignUpDialogComponent } from '../sign-up-dialog/sign-up-dialog.component';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
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
    component = runInInjectionContext(injector, () => new LoginDialogComponent());
  });

  it('should initialize with an invalid form when fields are empty', () => {
    expect(component.loginForm.invalid).toBe(true);
    expect(component.hidePassword()).toBe(true);
  });

  it('should toggle password visibility when togglePasswordVisibility is called', () => {
    expect(component.hidePassword()).toBe(true);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(false);
    component.togglePasswordVisibility();
    expect(component.hidePassword()).toBe(true);
  });

  it('should set resetPasswordSent when onForgotPassword is clicked', () => {
    expect(component.resetPasswordSent()).toBe(false);
    component.onForgotPassword();
    expect(component.resetPasswordSent()).toBe(true);
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

  it('should close login dialog and open SignUpDialogComponent on onSignUpClick', () => {
    component.onSignUpClick();
    expect(dialogRefMock.close).toHaveBeenCalledWith('open_signup');
    expect(dialogMock.open).toHaveBeenCalledWith(
      SignUpDialogComponent,
      expect.objectContaining({
        width: '560px',
      })
    );
  });

  it('should call authService.login and close on successful submission', () => {
    const mockAuthResponse = {
      accessToken: 'token-123',
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'USER' as const,
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    };

    vi.spyOn(authService, 'login').mockReturnValue(of(mockAuthResponse));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'Password123!',
    });

    expect(component.loginForm.valid).toBe(true);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith(mockAuthResponse);
  });

  it('should set errorMessage when authService.login fails', () => {
    vi.spyOn(authService, 'login').mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );

    component.loginForm.setValue({
      email: 'wrong@example.com',
      password: 'WrongPassword!',
    });

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid credentials');
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
