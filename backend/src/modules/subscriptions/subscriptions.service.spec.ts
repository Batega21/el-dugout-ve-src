import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../../database/prisma.service';
import { SubscriptionTier, BillingPeriod, SubscriptionStatus } from '@prisma/client';
import { UserNotFoundException, SubscriptionNotFoundException } from '../../common/errors';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    subscription: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should upsert a subscription with FREE plan when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-123', email: 'alice@example.com' });
      mockPrisma.subscription.upsert.mockImplementation(({ create }) =>
        Promise.resolve({
          id: 'sub-1',
          ...create,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.create('user-123', {
        plan: SubscriptionTier.FREE,
        billingPeriod: BillingPeriod.MONTHLY,
        renewalConsent: true,
        termsAccepted: true,
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        update: {
          plan: SubscriptionTier.FREE,
          billingPeriod: BillingPeriod.MONTHLY,
          renewalConsent: true,
          termsAccepted: true,
          status: SubscriptionStatus.ACTIVE,
        },
        create: {
          userId: 'user-123',
          plan: SubscriptionTier.FREE,
          billingPeriod: BillingPeriod.MONTHLY,
          renewalConsent: true,
          termsAccepted: true,
          status: SubscriptionStatus.ACTIVE,
        },
        include: expect.any(Object),
      });
      expect(result.id).toBe('sub-1');
      expect(result.userId).toBe('user-123');
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create('invalid-user', {
          plan: SubscriptionTier.PREMIUM,
          billingPeriod: BillingPeriod.ANNUAL,
        }),
      ).rejects.toThrow(UserNotFoundException);
    });

    it('should upsert a PREMIUM subscription with TRIALING status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-456' });
      mockPrisma.subscription.upsert.mockImplementation(({ create }) =>
        Promise.resolve({
          id: 'sub-2',
          ...create,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );

      const result = await service.create('user-456', {
        plan: SubscriptionTier.PREMIUM,
        billingPeriod: BillingPeriod.ANNUAL,
      });

      expect(result.status).toBe(SubscriptionStatus.TRIALING);
      expect(result.userId).toBe('user-456');
    });
  });

  describe('findAll', () => {
    it('should return all subscriptions', async () => {
      const mockList = [
        { id: 'sub-1', email: 'user1@example.com', plan: SubscriptionTier.FREE },
      ];
      mockPrisma.subscription.findMany.mockResolvedValue(mockList);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should filter by email when provided', async () => {
      mockPrisma.subscription.findMany.mockResolvedValue([]);
      await service.findAll('test@example.com');
      expect(mockPrisma.subscription.findMany).toHaveBeenCalledWith({
        where: {
          user: {
            email: {
              contains: 'test@example.com',
              mode: 'insensitive',
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('should throw SubscriptionNotFoundException if subscription not found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(SubscriptionNotFoundException);
    });

    it('should return subscription if found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue({
        id: 'sub-1',
        email: 'test@example.com',
      });
      const result = await service.findOne('sub-1');
      expect(result.id).toBe('sub-1');
    });
  });
});
