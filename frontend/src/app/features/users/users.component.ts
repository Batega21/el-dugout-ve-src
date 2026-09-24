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
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './users.component.scss',
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
