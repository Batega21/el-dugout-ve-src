import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { RequiresTier } from '../../common/decorators/tiers.decorator';
import { SubscriptionTier } from '@prisma/client';

@ApiTags('Premium Features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@Controller('features')
export class FeaturesController {
  @Get('basic')
  @RequiresTier(SubscriptionTier.BASIC)
  @ApiOperation({ summary: 'Access Basic tier feature (Accessible by Basic, Premium, or Admin)' })
  @ApiResponse({ status: 200, description: 'Basic tier content' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient subscription tier' })
  getBasicFeature() {
    return {
      tier: 'BASIC',
      featureName: 'Standard Analytics & Priority Queues',
      accessGranted: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('premium')
  @RequiresTier(SubscriptionTier.PREMIUM)
  @ApiOperation({ summary: 'Access Premium tier feature (Accessible by Premium or Admin bypass)' })
  @ApiResponse({ status: 200, description: 'Premium tier content' })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient subscription tier' })
  getPremiumFeature() {
    return {
      tier: 'PREMIUM',
      featureName: 'Advanced Enterprise AI & Unlimited Bandwidth',
      accessGranted: true,
      timestamp: new Date().toISOString(),
    };
  }
}
