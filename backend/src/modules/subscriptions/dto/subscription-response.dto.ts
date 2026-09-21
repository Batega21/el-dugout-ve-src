import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionTier, BillingPeriod, SubscriptionStatus } from '@prisma/client';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class SubscriptionResponseDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @ApiProperty({ enum: SubscriptionTier, example: SubscriptionTier.PREMIUM })
  plan: SubscriptionTier;

  @ApiProperty({ enum: BillingPeriod, example: BillingPeriod.MONTHLY })
  billingPeriod: BillingPeriod;

  @ApiProperty({ example: true })
  renewalConsent: boolean;

  @ApiProperty({ example: true })
  termsAccepted: boolean;

  @ApiProperty({ enum: SubscriptionStatus, example: SubscriptionStatus.TRIALING })
  status: SubscriptionStatus;

  @ApiProperty({ example: 'c0a8012e-8d19-4f32-8419-44d567781bcf' })
  userId: string;

  @ApiPropertyOptional({ type: () => UserResponseDto })
  user?: UserResponseDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

