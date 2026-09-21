export interface Project {
  id: string;
  title: string;
  description?: string;
  isPublic?: boolean;
}

import { Subscription } from './subscription.model';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber?: string | null;
  name?: string;
  avatarUrl?: string | null;
  role: 'USER' | 'ADMIN';
  tier?: 'FREE' | 'BASIC' | 'PREMIUM';
  twoFactorEnabled?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
  subscription?: Subscription | null;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber?: string;
  name?: string;
  avatarUrl?: string | null;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber?: string;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string | null;
  avatarUrl?: string | null;
  twoFactorEnabled?: boolean;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

