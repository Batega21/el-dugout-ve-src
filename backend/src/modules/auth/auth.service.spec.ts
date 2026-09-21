import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService, JwtTokenPayload } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { Role, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import {
  InvalidCredentialsException,
  AccountInactiveException,
  EmailAlreadyExistsException,
  UserNotFoundException,
  InvalidTokenException,
  ValidationFailedException,
} from '../../common/errors';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'jwtSecret':
          return 'test-secret-key-1234567890123456';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw InvalidCredentialsException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.login({ email: 'missing@example.com', password: 'password123' }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException if password does not match', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        email: 'user@example.com',
        password: hashedPassword,
        role: Role.USER,
        isActive: true,
        subscription: null,
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(InvalidCredentialsException);
    });

    it('should throw AccountInactiveException if account is inactive', async () => {
      const hashedPassword = await bcrypt.hash('valid-password', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-inactive',
        email: 'inactive@example.com',
        password: hashedPassword,
        role: Role.USER,
        isActive: false,
        subscription: null,
      });

      await expect(
        service.login({ email: 'inactive@example.com', password: 'valid-password' }),
      ).rejects.toThrow(AccountInactiveException);
    });

    it('should return auth response with role and FREE tier when user has no active subscription', async () => {
      const hashedPassword = await bcrypt.hash('valid-password', 10);
      const user = {
        id: 'u-free',
        email: 'free@example.com',
        name: 'Free User',
        password: hashedPassword,
        role: Role.USER,
        twoFactorEnabled: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.login({
        email: 'free@example.com',
        password: 'valid-password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe('free@example.com');
      expect(result.user.role).toBe(Role.USER);
      expect(result.user.tier).toBe(SubscriptionTier.FREE);

      // Verify token payload embeds role and tier
      const payload = service.verifyToken(result.accessToken);
      expect(payload.role).toBe(Role.USER);
      expect(payload.tier).toBe(SubscriptionTier.FREE);
    });

    it('should return auth response with PREMIUM tier when user has active premium subscription', async () => {
      const hashedPassword = await bcrypt.hash('valid-password', 10);
      const user = {
        id: 'u-prem',
        email: 'premium@example.com',
        name: 'Premium User',
        password: hashedPassword,
        role: Role.USER,
        twoFactorEnabled: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          id: 'sub-prem',
          plan: SubscriptionTier.PREMIUM,
          status: SubscriptionStatus.ACTIVE,
        },
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.login({
        email: 'premium@example.com',
        password: 'valid-password',
      });

      expect(result.user.tier).toBe(SubscriptionTier.PREMIUM);
      const payload = service.verifyToken(result.accessToken);
      expect(payload.tier).toBe(SubscriptionTier.PREMIUM);
    });

    it('should return role ADMIN and tier FREE for administrator accounts', async () => {
      const hashedPassword = await bcrypt.hash('admin-pass', 10);
      const admin = {
        id: 'u-admin',
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: Role.ADMIN,
        twoFactorEnabled: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: null,
      };
      mockPrisma.user.findUnique.mockResolvedValue(admin);

      const result = await service.login({
        email: 'admin@example.com',
        password: 'admin-pass',
      });

      expect(result.user.role).toBe(Role.ADMIN);
      expect(result.user.twoFactorEnabled).toBe(true);
      const payload = service.verifyToken(result.accessToken);
      expect(payload.role).toBe(Role.ADMIN);
    });
  });

  describe('register', () => {
    it('should throw EmailAlreadyExistsException if email is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          firstName: 'Duplicate',
          lastName: 'User',
          email: 'duplicate@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(EmailAlreadyExistsException);
    });

    it('should register a new standard user with role USER and tier FREE', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'new-user-id',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          subscription: null,
        }),
      );

      const result = await service.register({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        mobileNumber: '555-123-4567',
      });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          mobileNumber: '555-123-4567',
          role: Role.USER,
          twoFactorEnabled: false,
          isActive: true,
        }),
        include: { subscription: true },
      });

      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.firstName).toBe('New');
      expect(result.user.lastName).toBe('User');
      expect(result.user.role).toBe(Role.USER);
      expect(result.user.tier).toBe(SubscriptionTier.FREE);
    });
  });

  describe('getMe', () => {
    it('should return user profile with resolved tier', async () => {
      const user = {
        id: 'u-1',
        email: 'user@example.com',
        name: 'Jane Doe',
        avatarUrl: null,
        role: Role.USER,
        twoFactorEnabled: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          plan: SubscriptionTier.BASIC,
          status: SubscriptionStatus.ACTIVE,
        },
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await service.getMe('u-1');
      expect(result.id).toBe('u-1');
      expect(result.tier).toBe(SubscriptionTier.BASIC);
    });

    it('should throw UserNotFoundException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMe('non-existent')).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('signToken and verifyToken', () => {
    it('should sign and successfully verify a token with role and tier payload', () => {
      const payload: JwtTokenPayload = {
        sub: 'test-user-id',
        email: 'test@example.com',
        role: Role.ADMIN,
        tier: SubscriptionTier.PREMIUM,
        issuedAt: new Date().toISOString(),
      };

      const token = service.signToken(payload);
      expect(token).toBeDefined();
      expect(token.split('.')).toHaveLength(3);

      const verified = service.verifyToken(token);
      expect(verified.sub).toBe(payload.sub);
      expect(verified.email).toBe(payload.email);
      expect(verified.role).toBe(Role.ADMIN);
      expect(verified.tier).toBe(SubscriptionTier.PREMIUM);
    });

    it('should reject a tampered token signature', () => {
      const payload: JwtTokenPayload = {
        sub: 'test-user-id',
        email: 'test@example.com',
        role: Role.USER,
        tier: SubscriptionTier.FREE,
        issuedAt: new Date().toISOString(),
      };

      const token = service.signToken(payload);
      const [header, body] = token.split('.');
      const tamperedToken = `${header}.${body}.tampered_invalid_signature`;

      expect(() => service.verifyToken(tamperedToken)).toThrow(InvalidTokenException);
    });
  });

  describe('resolveUserTier', () => {
    it('should return FREE for ADMIN regardless of subscription', () => {
      const tier = service.resolveUserTier(Role.ADMIN, {
        plan: SubscriptionTier.PREMIUM,
        status: SubscriptionStatus.ACTIVE,
      });
      expect(tier).toBe(SubscriptionTier.FREE);
    });

    it('should return subscription plan if ACTIVE or TRIALING', () => {
      expect(
        service.resolveUserTier(Role.USER, {
          plan: SubscriptionTier.BASIC,
          status: SubscriptionStatus.ACTIVE,
        }),
      ).toBe(SubscriptionTier.BASIC);

      expect(
        service.resolveUserTier(Role.USER, {
          plan: SubscriptionTier.PREMIUM,
          status: SubscriptionStatus.TRIALING,
        }),
      ).toBe(SubscriptionTier.PREMIUM);
    });

    it('should return FREE if subscription is CANCELED, EXPIRED, or null', () => {
      expect(
        service.resolveUserTier(Role.USER, {
          plan: SubscriptionTier.PREMIUM,
          status: SubscriptionStatus.CANCELED,
        }),
      ).toBe(SubscriptionTier.FREE);

      expect(
        service.resolveUserTier(Role.USER, {
          plan: SubscriptionTier.BASIC,
          status: SubscriptionStatus.EXPIRED,
        }),
      ).toBe(SubscriptionTier.FREE);

      expect(service.resolveUserTier(Role.USER, null)).toBe(SubscriptionTier.FREE);
    });
  });

  describe('updateProfile', () => {
    const existingPasswordHash = bcrypt.hashSync('CurrentPassword123!', 10);
    const mockUser = {
      id: 'u-update-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      mobileNumber: '555-123-4567',
      avatarUrl: null,
      twoFactorEnabled: false,
      password: existingPasswordHash,
      role: Role.USER,
      isActive: true,
      subscription: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should throw NotFoundException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('unknown-id', { firstName: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update profile fields without altering password when no new password is provided', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Jane',
        lastName: 'Smith',
        avatarUrl: 'https://example.com/avatar.jpg',
        twoFactorEnabled: true,
      });

      const result = await service.updateProfile('u-update-1', {
        firstName: 'Jane',
        lastName: 'Smith',
        avatarUrl: 'https://example.com/avatar.jpg',
        twoFactorEnabled: true,
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u-update-1' },
          data: {
            firstName: 'Jane',
            lastName: 'Smith',
            avatarUrl: 'https://example.com/avatar.jpg',
            twoFactorEnabled: true,
          },
        }),
      );
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.avatarUrl).toBe('https://example.com/avatar.jpg');
      expect(result.twoFactorEnabled).toBe(true);
    });

    it('should throw BadRequestException if newPassword is provided without currentPassword', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.updateProfile('u-update-1', { newPassword: 'NewPassword123!' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if newPassword and confirmPassword do not match', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.updateProfile('u-update-1', {
          currentPassword: 'CurrentPassword123!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'MismatchPassword123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if currentPassword is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.updateProfile('u-update-1', {
          currentPassword: 'WrongPassword!',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should successfully update password when currentPassword is valid', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockImplementation(async ({ data }: any) => ({
        ...mockUser,
        ...data,
      }));

      const result = await service.updateProfile('u-update-1', {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });

      expect(mockPrisma.user.update).toHaveBeenCalled();
      const updateArgs = mockPrisma.user.update.mock.calls[0][0];
      const match = await bcrypt.compare('NewPassword123!', updateArgs.data.password);
      expect(match).toBe(true);
      expect(result.id).toBe('u-update-1');
    });
  });
});
