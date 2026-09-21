import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionTier, BillingPeriod, SubscriptionStatus } from '@prisma/client';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;

  const mockSubscriptionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [
        {
          provide: SubscriptionsService,
          useValue: mockSubscriptionsService,
        },
      ],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a subscription via service for authenticated user', async () => {
      const dto = {
        plan: SubscriptionTier.PREMIUM,
        billingPeriod: BillingPeriod.MONTHLY,
      };
      const req = { user: { id: 'user-123' } };
      const expectedResult = {
        id: 'sub-uuid',
        ...dto,
        renewalConsent: true,
        termsAccepted: true,
        status: SubscriptionStatus.TRIALING,
        userId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSubscriptionsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(req, dto);
      expect(mockSubscriptionsService.create).toHaveBeenCalledWith('user-123', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all subscriptions', async () => {
      mockSubscriptionsService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(mockSubscriptionsService.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });

    it('should pass email filter if query provided', async () => {
      mockSubscriptionsService.findAll.mockResolvedValue([]);
      await controller.findAll('john@example.com');
      expect(mockSubscriptionsService.findAll).toHaveBeenCalledWith('john@example.com');
    });
  });

  describe('findOne', () => {
    it('should return subscription by id', async () => {
      const expected = { id: 'sub-1', email: 'john@example.com' };
      mockSubscriptionsService.findOne.mockResolvedValue(expected);
      const result = await controller.findOne('sub-1');
      expect(mockSubscriptionsService.findOne).toHaveBeenCalledWith('sub-1');
      expect(result).toEqual(expected);
    });
  });
});
