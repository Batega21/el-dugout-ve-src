import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, SubscriptionTier } from '@prisma/client';
import { TIERS_KEY } from '../decorators/tiers.decorator';
import { SubscriptionTierRequiredException, UnauthorizedException } from '../errors';

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.BASIC]: 1,
  [SubscriptionTier.PREMIUM]: 2,
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTierMeta = this.reflector.getAllAndOverride<
      SubscriptionTier | SubscriptionTier[]
    >(TIERS_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredTierMeta) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Administrative roles bypass all subscription tier checks
    if (user.role === Role.ADMIN) {
      return true;
    }

    const userTier: SubscriptionTier = user.tier || SubscriptionTier.FREE;
    const userTierLevel = TIER_HIERARCHY[userTier] ?? 0;

    if (Array.isArray(requiredTierMeta)) {
      const isAllowed = requiredTierMeta.some(
        (tier) => userTierLevel >= (TIER_HIERARCHY[tier] ?? 0),
      );
      if (!isAllowed) {
        throw new SubscriptionTierRequiredException();
      }
      return true;
    }

    const requiredLevel = TIER_HIERARCHY[requiredTierMeta] ?? 0;
    if (userTierLevel < requiredLevel) {
      throw new SubscriptionTierRequiredException();
    }

    return true;
  }
}
