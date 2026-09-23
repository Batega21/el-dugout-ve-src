import { isAdminRoute } from './admin-route.util';

describe('isAdminRoute', () => {
  it('should identify root /admin as an admin route', () => {
    expect(isAdminRoute('/admin')).toBe(true);
    expect(isAdminRoute('/admin/')).toBe(true);
  });

  it('should identify subroutes under /admin as admin routes', () => {
    expect(isAdminRoute('/admin/imports')).toBe(true);
    expect(isAdminRoute('/admin/dashboard')).toBe(true);
    expect(isAdminRoute('/admin/reports/2026')).toBe(true);
  });

  it('should identify /users as an admin route', () => {
    expect(isAdminRoute('/users')).toBe(true);
    expect(isAdminRoute('/users/')).toBe(true);
    expect(isAdminRoute('/users/123')).toBe(true);
  });

  it('should handle URLs with query parameters and fragment identifiers', () => {
    expect(isAdminRoute('/admin/imports?batch=2026&type=excel')).toBe(true);
    expect(isAdminRoute('/users?page=2#top')).toBe(true);
    expect(isAdminRoute('/admin?tab=overview#section-1')).toBe(true);
  });

  it('should return false for non-admin public or customer routes', () => {
    expect(isAdminRoute('/')).toBe(false);
    expect(isAdminRoute('/profile')).toBe(false);
    expect(isAdminRoute('/premium')).toBe(false);
    expect(isAdminRoute('/login')).toBe(false);
    expect(isAdminRoute('/home')).toBe(false);
  });

  it('should return false for routes that share partial prefix without slash boundary', () => {
    expect(isAdminRoute('/administrator')).toBe(false);
    expect(isAdminRoute('/username')).toBe(false);
  });

  it('should return false for falsy or empty values', () => {
    expect(isAdminRoute('')).toBe(false);
    expect(isAdminRoute(null)).toBe(false);
    expect(isAdminRoute(undefined)).toBe(false);
  });
});
