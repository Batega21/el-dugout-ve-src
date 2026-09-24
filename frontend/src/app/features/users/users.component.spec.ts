// @vitest-environment jsdom
import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { UsersComponent } from './users.component';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../core/models/user.model';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let injector: Injector;

  let mockUsersService: {
    getUsers: any;
    createUser: any;
    deleteUser: any;
  };

  const sampleUsers: User[] = [
    {
      id: 'u-1',
      email: 'miguel.cabrera@lvbp.com',
      firstName: 'Miguel',
      lastName: 'Cabrera',
      name: 'Miguel Cabrera',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      projects: [],
    },
    {
      id: 'u-2',
      email: 'luis.aparicio@lvbp.com',
      firstName: 'Luis',
      lastName: 'Aparicio',
      name: 'Luis Aparicio',
      role: 'USER',
      isActive: false,
      createdAt: '2026-02-01',
      updatedAt: '2026-02-01',
      projects: [],
    },
  ];

  beforeEach(() => {
    mockUsersService = {
      getUsers: vi.fn(() => of(sampleUsers)),
      createUser: vi.fn((input: any) => of({ id: 'u-3', ...input })),
      deleteUser: vi.fn(() => of(undefined)),
    };

    injector = Injector.create({
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    });

    component = runInInjectionContext(injector, () => new UsersComponent());
  });

  it('should create the users component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users on ngOnInit', () => {
    component.ngOnInit();
    expect(mockUsersService.getUsers).toHaveBeenCalled();
    expect(component.users()).toEqual(sampleUsers);
    expect(component.loading()).toBe(false);
  });

  it('should handle error when loading users fails', () => {
    mockUsersService.getUsers.mockReturnValue(throwError(() => ({ error: { message: 'Network error' } })));
    component.loadUsers();
    expect(component.errorMessage()).toBe('Network error');
    expect(component.loading()).toBe(false);
  });

  it('should submit form and create user', () => {
    component.formData = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New Player',
      firstName: 'New',
      lastName: 'Player',
    };

    component.onSubmit();
    expect(mockUsersService.createUser).toHaveBeenCalled();
    expect(component.successMessage()).toContain('new@example.com created successfully');
    expect(component.submitting()).toBe(false);
  });

  it('should not submit form if email or password is empty', () => {
    component.formData.email = '';
    component.formData.password = '';
    component.onSubmit();
    expect(mockUsersService.createUser).not.toHaveBeenCalled();
  });

  it('should delete user when confirm is accepted', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.users.set(sampleUsers);
    component.deleteUser(sampleUsers[0]);

    expect(mockUsersService.deleteUser).toHaveBeenCalledWith('u-1');
    expect(component.users().length).toBe(1);
    expect(component.successMessage()).toContain('deleted');
  });

  it('should not delete user when confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    component.users.set(sampleUsers);
    component.deleteUser(sampleUsers[0]);

    expect(mockUsersService.deleteUser).not.toHaveBeenCalled();
    expect(component.users().length).toBe(2);
  });
});
