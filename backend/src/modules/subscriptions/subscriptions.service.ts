import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionTier, SubscriptionStatus, BillingPeriod } from '@prisma/client';
import { UserNotFoundException, SubscriptionNotFoundException } from '../../common/errors';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSubscriptionDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new UserNotFoundException();
    }

    const plan = dto.plan ?? SubscriptionTier.FREE;
    const initialStatus =
      plan === SubscriptionTier.PREMIUM
        ? SubscriptionStatus.TRIALING
        : SubscriptionStatus.ACTIVE;

    const billingPeriod = dto.billingPeriod ?? BillingPeriod.MONTHLY;
    const renewalConsent = dto.renewalConsent ?? true;
    const termsAccepted = dto.termsAccepted ?? true;

    // 1:1 relationship upsert
    return this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        billingPeriod,
        renewalConsent,
        termsAccepted,
        status: initialStatus,
      },
      create: {
        userId,
        plan,
        billingPeriod,
        renewalConsent,
        termsAccepted,
        status: initialStatus,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findAll(email?: string) {
    const where = email
      ? { user: { email: { contains: email, mode: 'insensitive' as const } } }
      : {};

    return this.prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new SubscriptionNotFoundException();
    }

    return subscription;
  }
}

