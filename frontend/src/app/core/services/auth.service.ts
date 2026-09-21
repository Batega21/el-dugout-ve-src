import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, UpdateProfileInput } from '../models/user.model';
import { SubscriptionTier } from '../models/subscription.model';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

const STORAGE_USER_KEY = 'el_dugout_auth_user';
const STORAGE_TOKEN_KEY = 'el_dugout_auth_token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<User | null>(this.loadStoredUser());
  readonly accessToken = signal<string | null>(this.loadStoredToken());

  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  readonly currentRole = computed(() => this.currentUser()?.role ?? null);

  /**
   * Reactive signal for current subscription tier.
   * Admin users never hold subscriptions.
   */
  readonly currentTier = computed<SubscriptionTier>(() => {
    const user = this.currentUser();
    if (!user) return 'FREE';
    if (user.role === 'ADMIN') return 'FREE';

    const plan = (user.subscription?.plan?.toUpperCase() as any) || (user.tier?.toUpperCase() as any) || 'FREE';
    return (['FREE', 'BASIC', 'PREMIUM'].includes(plan) ? plan : 'FREE') as SubscriptionTier;
  });

  /**
   * Returns true if user has a paid active subscription (BASIC or PREMIUM).
   */
  readonly hasActiveSubscription = computed<boolean>(() => {
    const user = this.currentUser();
    if (!user || user.role === 'ADMIN') return false;
    const tier = this.currentTier();
    return tier === 'BASIC' || tier === 'PREMIUM';
  });

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('auth/login', credentials).pipe(
      tap((res) => {
        this.saveAuth(res);
      })
    );
  }

  register(input: RegisterInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('auth/register', input).pipe(
      tap((res) => {
        this.saveAuth(res);
      })
    );
  }

  updateProfile(input: UpdateProfileInput): Observable<User> {
    return this.http.patch<User>('auth/profile', input).pipe(
      tap((updatedUser) => {
        this.currentUser.set(updatedUser);
        if (this.isBrowser()) {
          try {
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser));
          } catch (err) {
            console.warn('Unable to persist updated user to localStorage', err);
          }
        }
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.accessToken.set(null);
    if (this.isBrowser()) {
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_TOKEN_KEY);
    }
  }

  /**
   * Helper for development/testing to toggle or simulate an authenticated user.
   */
  setMockUser(user: User | null, token: string = 'mock-token'): void {
    if (user) {
      this.saveAuth({ user, accessToken: token });
    } else {
      this.logout();
    }
  }

  private saveAuth(res: AuthResponse): void {
    this.currentUser.set(res.user);
    this.accessToken.set(res.accessToken);

    if (this.isBrowser()) {
      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.user));
        localStorage.setItem(STORAGE_TOKEN_KEY, res.accessToken);
      } catch (err) {
        console.warn('Unable to persist auth state to localStorage', err);
      }
    }
  }

  private loadStoredUser(): User | null {
    if (!this.isBrowser()) return null;
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }

  private loadStoredToken(): string | null {
    if (!this.isBrowser()) return null;
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
