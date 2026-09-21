import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import {
  InvalidCredentialsException,
  AccountInactiveException,
  EmailAlreadyExistsException,
  UserNotFoundException,
  InvalidTokenException,
  ValidationFailedException,
} from '../../common/errors';

export interface JwtTokenPayload {
  sub: string;
  email: string;
  role: Role;
  tier: SubscriptionTier;
  issuedAt: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret =
      this.configService.get<string>('jwtSecret') ||
      'dev-secret-key-change-in-prod';
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase() },
      include: { subscription: true },
    });

    if (!user || !user.password) {
      throw new InvalidCredentialsException();
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new InvalidCredentialsException();
    }

    if (!user.isActive) {
      throw new AccountInactiveException();
    }

    // Resolve subscription tier:
    // Admin users never have a subscription. Their role ADMIN permits bypassing tier checks.
    // For regular users, resolve from active subscription or default to FREE.
    const tier = this.resolveUserTier(user.role, user.subscription);

    return this.buildAuthResponse(user, tier);
  }

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new EmailAlreadyExistsException();
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        mobileNumber: registerDto.mobileNumber || null,
        password: hashedPassword,
        role: Role.USER,
        twoFactorEnabled: false,
        isActive: true,
      },
      include: { subscription: true },
    });

    const tier = SubscriptionTier.FREE;
    return this.buildAuthResponse(user, tier);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new UserNotFoundException();
    }

    const tier = this.resolveUserTier(user.role, user.subscription);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      name: `${user.firstName} ${user.lastName}`.trim(),
      avatarUrl: user.avatarUrl,
      role: user.role,
      tier,
      twoFactorEnabled: user.twoFactorEnabled,
      isActive: user.isActive,
      subscription: user.subscription,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    let hashedPassword: string | undefined;
    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required to update your password');
      }

      if (dto.confirmPassword && dto.newPassword !== dto.confirmPassword) {
        throw new BadRequestException('New password and confirmation do not match');
      }

      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    }

    const updateData: any = {};
    if (dto.firstName !== undefined) updateData.firstName = dto.firstName;
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (dto.mobileNumber !== undefined) updateData.mobileNumber = dto.mobileNumber || null;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl || null;
    if (dto.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = dto.twoFactorEnabled;
    if (hashedPassword) updateData.password = hashedPassword;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { subscription: true },
    });

    const tier = this.resolveUserTier(updatedUser.role, updatedUser.subscription);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      mobileNumber: updatedUser.mobileNumber,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      tier,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      isActive: updatedUser.isActive,
      subscription: updatedUser.subscription,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * Resolves the subscription tier based on role and subscription status.
   * Admin users never hold subscriptions.
   */
  resolveUserTier(
    role: Role,
    subscription?: { plan: SubscriptionTier; status: SubscriptionStatus } | null,
  ): SubscriptionTier {
    if (role === Role.ADMIN) {
      return SubscriptionTier.FREE;
    }

    if (
      subscription &&
      (subscription.status === SubscriptionStatus.ACTIVE ||
        subscription.status === SubscriptionStatus.TRIALING)
    ) {
      return subscription.plan;
    }

    return SubscriptionTier.FREE;
  }

  /**
   * Cryptographically signs a JWT token using HMAC SHA-256.
   */
  signToken(payload: JwtTokenPayload): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const data = `${header}.${body}`;
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(data)
      .digest('base64url');

    return `${data}.${signature}`;
  }

  /**
   * Verifies and decodes a signed JWT token using HMAC SHA-256.
   */
  verifyToken(token: string): JwtTokenPayload {
    const cleanToken = token
      .replace(/^Bearer\s+/i, '')
      .replace(/^bearer_/i, '')
      .trim();

    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      throw new InvalidTokenException('Invalid token format');
    }

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      throw new InvalidTokenException('Invalid token signature');
    }

    try {
      const decodedJson = Buffer.from(body, 'base64url').toString('utf-8');
      const payload = JSON.parse(decodedJson) as JwtTokenPayload;

      if (!payload.sub || !payload.email || !payload.role || !payload.tier) {
        throw new InvalidTokenException('Token payload is missing required claims');
      }

      return payload;
    } catch {
      throw new InvalidTokenException('Malformed token payload');
    }
  }

  private buildAuthResponse(
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      mobileNumber?: string | null;
      name?: string | null;
      avatarUrl?: string | null;
      role: Role;
      twoFactorEnabled?: boolean;
      isActive: boolean;
      createdAt: Date;
      updatedAt: Date;
      subscription?: any;
    },
    tier: SubscriptionTier,
  ) {
    const tokenPayload: JwtTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tier,
      issuedAt: new Date().toISOString(),
    };

    const accessToken = this.signToken(tokenPayload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNumber: user.mobileNumber ?? null,
        name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
        avatarUrl: user.avatarUrl,
        role: user.role,
        tier,
        twoFactorEnabled: user.twoFactorEnabled ?? false,
        isActive: user.isActive,
        subscription: user.subscription ?? null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}

