import { SetMetadata } from '@nestjs/common';
import { SubscriptionTier } from '@prisma/client';

export const TIERS_KEY = 'tiers';

/**
 * Decorator to specify minimum subscription tier required to access an endpoint.
 * Administrative users automatically bypass this requirement.
 */
export const RequiresTier = (tier: SubscriptionTier) => SetMetadata(TIERS_KEY, tier);
export const Tiers = (...tiers: SubscriptionTier[]) => SetMetadata(TIERS_KEY, tiers);
