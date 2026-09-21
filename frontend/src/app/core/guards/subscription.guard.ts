import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SubscriptionTier } from '../models/subscription.model';

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  FREE: 0,
  BASIC: 1,
  PREMIUM: 2,
};

/**
 * Functional subscription route guard that inspects route data attributes
 * for required tiers and redirects free-tier users to the subscription or upgrade view.
 * Administrative users automatically bypass all tier checks.
 */
export const subscriptionGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Admins bypass all subscription checks
  if (authService.isAdmin()) {
    return true;
  }

  // 2. Evaluate current tier against route required tier
  const requiredTier = (route.data?.['requiredTier'] as SubscriptionTier) || 'BASIC';
  const currentTier = authService.currentTier();

  const userLevel = TIER_HIERARCHY[currentTier] ?? 0;
  const requiredLevel = TIER_HIERARCHY[requiredTier] ?? 1;

  if (userLevel >= requiredLevel) {
    return true;
  }

  // 3. Redirect unauthorized/free tier users with upgrade intent
  return router.createUrlTree(['/'], {
    queryParams: { upgrade: requiredTier },
  });
};
