import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { subscriptionGuard } from './core/guards/subscription.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    data: { adminOnly: true },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'imports',
        loadComponent: () =>
          import('./modules/admin/components/import-file/import-file.component').then(
            (m) => m.ImportFileComponent,
          ),
      },
    ],
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    data: { adminOnly: true },
    loadComponent: () => import('./features/users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'premium',
    canActivate: [subscriptionGuard],
    data: { requiredTier: 'PREMIUM' },
    loadComponent: () =>
      import('./features/premium/premium-feature.component').then(
        (m) => m.PremiumFeatureComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

