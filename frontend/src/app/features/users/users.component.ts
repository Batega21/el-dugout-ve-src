import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { UsersService } from '../../core/services/users.service';
import { User, CreateUserInput } from '../../core/models/user.model';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, StatusBadgeComponent, TranslatePipe],
  template: `
    <div class="users-page">
      <!-- Breadcrumbs -->
      <nav class="breadcrumb-nav" aria-label="Breadcrumbs">
        <a routerLink="/admin" class="breadcrumb-link">{{ 'IMPORT_EXCEL.HEADER.BREADCRUMB_DASHBOARD' | translate }}</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ 'USERS.BREADCRUMB_CURRENT' | translate }}</span>
      </nav>

      <div class="page-header">
        <div>
          <h1>{{ 'USERS.TITLE' | translate }}</h1>
          <p class="subtitle">{{ 'USERS.SUBTITLE' | translate }}</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin" class="btn btn-outline">
            <mat-icon>arrow_back</mat-icon>
            {{ 'IMPORT_EXCEL.ACTIONS.BACK_DASHBOARD' | translate }}
          </a>
          <button (click)="loadUsers()" class="btn btn-outline" [disabled]="loading()">
            <mat-icon>refresh</mat-icon>
            {{ (loading() ? 'ADMIN.REFRESHING' : 'USERS.REFRESH_USERS') | translate }}
          </button>
        </div>
      </div>
    
      <!-- Notification Alerts -->
      @if (errorMessage()) {
        <div class="alert alert-error">
          {{ errorMessage() }}
        </div>
      }
      @if (successMessage()) {
        <div class="alert alert-success">
          {{ successMessage() }}
        </div>
      }
    
      <div class="users-layout">
        <!-- Users List -->
        <div class="card list-card">
          <div class="card-title-row">
            <h2>{{ 'USERS.REGISTERED_USERS' | translate }} ({{ users().length }})</h2>
          </div>
    
          @if (loading() && users().length === 0) {
            <div class="loading-state">
              <p>{{ 'USERS.LOADING_USERS' | translate }}</p>
            </div>
          }
    
          @if (!loading() && users().length === 0) {
            <div class="empty-state">
              <p>{{ 'USERS.NO_USERS' | translate }}</p>
            </div>
          }
    
          @if (users().length > 0) {
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ 'USERS.COL_NAME_EMAIL' | translate }}</th>
                    <th>{{ 'USERS.COL_ROLE' | translate }}</th>
                    <th>{{ 'USERS.COL_PROJECTS' | translate }}</th>
                    <th>{{ 'USERS.COL_STATUS' | translate }}</th>
                    <th>{{ 'USERS.COL_CREATED' | translate }}</th>
                    <th>{{ 'USERS.COL_ACTIONS' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user) {
                    <tr>
                      <td>
                        <div class="user-cell">
                          <span class="user-name">{{ user.name || ('COMMON.TIERS.USER' | translate) }}</span>
                          <span class="user-email">{{ user.email }}</span>
                        </div>
                      </td>
                      <td>
                        <span class="role-tag" [class.admin]="user.role === 'ADMIN'">
                          {{ user.role }}
                        </span>
                      </td>
                      <td>
                        <span class="projects-count">{{ user.projects?.length || 0 }} {{ 'USERS.PROJECTS_COUNT' | translate }}</span>
                      </td>
                      <td>
                        <app-status-badge
                          [text]="(user.isActive ? 'USERS.ACTIVE' : 'USERS.INACTIVE') | translate"
                          [type]="user.isActive ? 'success' : 'neutral'">
                        </app-status-badge>
                      </td>
                      <td>
                        <span class="date-text">{{ user.createdAt | date:'shortDate' }}</span>
                      </td>
                      <td>
                        <button
                          (click)="deleteUser(user)"
                          class="btn-delete"
                          [title]="'USERS.DELETE' | translate"
                          [disabled]="deletingId() === user.id">
                          {{ deletingId() === user.id ? '...' : ('USERS.DELETE' | translate) }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
    
        <!-- Create User Form -->
        <div class="card form-card">
          <h2>{{ 'USERS.CREATE_TITLE' | translate }}</h2>
          <p class="form-desc">{{ 'USERS.CREATE_DESC' | translate }}</p>
    
          <form (ngSubmit)="onSubmit()" #userForm="ngForm">
            <div class="form-group">
              <label for="name">{{ 'USERS.FULL_NAME' | translate }}</label>
              <input
                id="name"
                name="name"
                type="text"
                class="form-control"
                placeholder="e.g. John Doe"
                [(ngModel)]="formData.name"
                />
            </div>
    
            <div class="form-group">
              <label for="email">{{ 'USERS.EMAIL_REQUIRED' | translate }}</label>
              <input
                id="email"
                name="email"
                type="email"
                class="form-control"
                placeholder="e.g. john@example.com"
                required
                [(ngModel)]="formData.email"
                />
            </div>
    
            <div class="form-group">
              <label for="password">{{ 'USERS.PASSWORD_REQUIRED' | translate }}</label>
              <input
                id="password"
                name="password"
                type="password"
                class="form-control"
                [placeholder]="'USERS.PASSWORD_MIN' | translate"
                required
                minlength="6"
                [(ngModel)]="formData.password"
                />
            </div>
    
            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="submitting() || !userForm.form.valid">
              {{ (submitting() ? 'USERS.CREATING' : 'USERS.ADD_USER') | translate }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .users-page {
      padding: 2.5rem 0;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: var(--font-size-sm, 0.85rem);
      font-family: var(--font-sans);
      margin-bottom: 1.25rem;
    }

    .breadcrumb-link {
      color: var(--text-secondary-color, var(--text-secondary, #9ca3af));
      text-decoration: none;
      transition: color 0.15s ease;

      &:hover {
        color: var(--primary-color, var(--primary, #e52323));
      }
    }

    .breadcrumb-sep {
      color: var(--text-muted-color, var(--text-muted, #4b5563));
    }

    .breadcrumb-current {
      color: var(--text-color, var(--text-primary, #f3f4f6));
      font-weight: var(--font-weight-medium, 500);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;

      h1 {
        font-family: var(--font-display);
        font-size: var(--font-size-2xl, 2rem);
        font-weight: var(--font-weight-bold, 700);
        color: var(--text-color);
        margin-bottom: 0.25rem;
      }

      .subtitle {
        font-family: var(--font-sans);
        color: var(--text-secondary-color, var(--text-secondary));
        font-size: var(--font-size-sm, 0.95rem);
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        text-decoration: none;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .alert {
      padding: 1rem;
      border-radius: var(--radius-sm);
      margin-bottom: 1.5rem;
      font-size: var(--font-size-sm, 0.875rem);

      &.alert-error {
        background-color: rgba(239, 68, 68, 0.15);
        color: var(--danger, #f87171);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }

      &.alert-success {
        background-color: rgba(16, 185, 129, 0.15);
        color: var(--success, #34d399);
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
    }

    .users-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background-color: var(--background-card-color, var(--bg-card));
      border: 1px solid var(--border-theme-color, var(--border-color));
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }

    .card-title-row {
      margin-bottom: 1.25rem;
      h2 {
        font-family: var(--font-display);
        font-size: var(--font-size-lg, 1.25rem);
        font-weight: var(--font-weight-semibold, 600);
        color: var(--text-color);
      }
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: var(--font-size-sm, 0.875rem);

      th {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--border-subtle, var(--border-color));
        color: var(--text-muted-color, var(--text-muted));
        font-weight: var(--font-weight-medium, 500);
      }

      td {
        padding: 0.875rem 1rem;
        border-bottom: 1px solid var(--border-subtle, var(--border-color));
        color: var(--text-color, var(--text-primary));
      }

      tr:last-child td {
        border-bottom: none;
      }

      .user-cell {
        display: flex;
        flex-direction: column;
        .user-name {
          font-weight: 600;
        }
        .user-email {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
      }

      .role-tag {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;

        &.admin {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }
      }

      .projects-count {
        font-size: 0.8rem;
        color: var(--text-secondary);
      }

      .date-text {
        font-size: 0.8rem;
        color: var(--text-muted);
      }

      .btn-delete {
        background: none;
        border: none;
        color: #ef4444;
        cursor: pointer;
        font-size: 0.8rem;
        font-weight: 500;
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm);
        &:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      }
    }

    .loading-state, .empty-state {
      padding: 3rem 1rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .form-card {
      h2 {
        font-size: 1.25rem;
        margin-bottom: 0.25rem;
      }
      .form-desc {
        color: var(--text-secondary);
        font-size: 0.85rem;
        margin-bottom: 1.5rem;
      }
    }

    .form-group {
      margin-bottom: 1.25rem;

      label {
        display: block;
        font-size: 0.825rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
      }

      .form-control {
        width: 100%;
        padding: 0.625rem 0.875rem;
        background-color: var(--bg-main);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-sm);
        color: var(--text-primary);
        font-size: 0.875rem;
        font-family: inherit;

        &:focus {
          outline: none;
          border-color: var(--primary);
        }
      }
    }

    .btn-block {
      width: 100%;
    }
  `],
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  deletingId = signal<string | null>(null);

  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  formData: CreateUserInput = {
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    password: '',
  };

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to fetch users. Ensure the backend is running at http://localhost:3000.',
        );
      },
    });
  }

  onSubmit() {
    if (!this.formData.email || !this.formData.password) return;

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.usersService.createUser(this.formData).subscribe({
      next: (newUser) => {
        this.submitting.set(false);
        this.successMessage.set(`User ${newUser.email} created successfully!`);
        this.formData = { firstName: '', lastName: '', name: '', email: '', password: '' };
        this.loadUsers();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to create user. Please check form inputs.',
        );
      },
    });
  }

  deleteUser(user: User) {
    if (!confirm(`Are you sure you want to delete ${user.email}?`)) return;

    this.deletingId.set(user.id);
    this.errorMessage.set(null);

    this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.successMessage.set(`User ${user.email} deleted.`);
        this.users.set(this.users().filter((u) => u.id !== user.id));
      },
      error: (err) => {
        this.deletingId.set(null);
        this.errorMessage.set(err?.error?.message || 'Failed to delete user.');
      },
    });
  }
}
