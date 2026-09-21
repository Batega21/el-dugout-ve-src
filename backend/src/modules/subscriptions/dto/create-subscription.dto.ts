import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { SubscriptionTier, BillingPeriod } from '@prisma/client';

export class CreateSubscriptionDto {
  @ApiPropertyOptional({
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
    description: 'Subscription tier plan (FREE, BASIC, or PREMIUM)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(SubscriptionTier, { message: 'Plan must be FREE, BASIC, or PREMIUM' })
  @IsOptional()
  plan?: SubscriptionTier = SubscriptionTier.FREE;

  @ApiPropertyOptional({
    enum: BillingPeriod,
    default: BillingPeriod.MONTHLY,
    description: 'Billing frequency (MONTHLY or ANNUAL)',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(BillingPeriod, { message: 'Billing period must be either MONTHLY or ANNUAL' })
  @IsOptional()
  billingPeriod?: BillingPeriod = BillingPeriod.MONTHLY;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Consent for automatic subscription renewal',
  })
  @IsBoolean()
  @IsOptional()
  renewalConsent?: boolean = true;

  @ApiPropertyOptional({
    example: true,
    default: true,
    description: 'Acceptance of terms of service and privacy policy',
  })
  @IsBoolean()
  @IsOptional()
  termsAccepted?: boolean = true;
}

