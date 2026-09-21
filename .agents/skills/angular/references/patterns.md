# Angular 19+ Design Patterns & Code Snippets

Reference implementations for common frontend tasks in this repository.

---

## 1. Signal-Based Feature Component

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="users-container">
      <h2>Team Members ({{ count() }})</h2>

      @if (isLoading()) {
        <div class="spinner">Loading users...</div>
      } @else if (errorMessage()) {
        <div class="alert alert-danger">{{ errorMessage() }}</div>
      } @else {
        <ul class="users-list">
          @for (user of users(); track user.id) {
            <li class="user-card">
              <strong>{{ user.name ?? 'Unnamed' }}</strong>
              <span>{{ user.email }}</span>
              <span class="badge">{{ user.role }}</span>
            </li>
          } @empty {
            <li class="empty-state">No users registered yet.</li>
          }
        </ul>
      }
    </section>
  `,
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  // State signals
  readonly users = signal<User[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  // Computed state
  readonly count = computed(() => this.users().length);

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to load users');
        this.isLoading.set(false);
      },
    });
  }
}
```

---

## 2. Typed API Service Pattern

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(payload: { email: string; name?: string; role?: string }): Observable<User> {
    return this.http.post<User>(this.baseUrl, payload);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
```

---

## 3. Signal Input and Output Component Pattern

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'badge badge-' + variant()" (click)="badgeClicked.emit(label())">
      {{ label() }}
    </span>
  `,
})
export class UserBadgeComponent {
  // Required input signal
  readonly label = input.required<string>();

  // Optional input signal with default
  readonly variant = input<'primary' | 'secondary' | 'success'>('primary');

  // Output event emitter
  readonly badgeClicked = output<string>();
}
```
