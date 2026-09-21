import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserInput } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('users');
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`users/${id}`);
  }

  createUser(input: CreateUserInput): Observable<User> {
    return this.http.post<User>('users', input);
  }

  deleteUser(id: string): Observable<{ id: string; email: string }> {
    return this.http.delete<{ id: string; email: string }>(`users/${id}`);
  }
}
