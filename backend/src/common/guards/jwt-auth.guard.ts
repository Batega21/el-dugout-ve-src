import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';
import { Role, SubscriptionTier } from '@prisma/client';
import { UnauthorizedException, InvalidTokenException } from '../errors';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  tier: SubscriptionTier;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(@Optional() private readonly configService?: ConfigService) {
    this.jwtSecret =
      this.configService?.get<string>('jwtSecret') ||
      process.env.JWT_SECRET ||
      'dev-secret-key-change-in-prod';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Extract Authorization Bearer token (no IAM header bypass)
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authentication token is required');
    }

    const token = authHeader
      .replace(/^Bearer\s+/i, '')
      .replace(/^bearer_/i, '')
      .trim();

    const parts = token.split('.');

    // Standard 3-part signed JWT: header.payload.signature
    if (parts.length === 3) {
      const [header, body, signature] = parts;
      const expectedSig = crypto
        .createHmac('sha256', this.jwtSecret)
        .update(`${header}.${body}`)
        .digest('base64url');

      if (signature !== expectedSig) {
        throw new InvalidTokenException('Invalid or expired authentication token');
      }

      try {
        const decodedJson = Buffer.from(body, 'base64url').toString('utf-8');
        const payload = JSON.parse(decodedJson);

        if (!payload.sub || !payload.email || !payload.role) {
          throw new InvalidTokenException('Invalid token payload claims');
        }

        (request as any).user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role as Role,
          tier: (payload.tier as SubscriptionTier) || SubscriptionTier.FREE,
        };

        return true;
      } catch {
        throw new InvalidTokenException('Malformed token payload');
      }
    }

    // Fallback for legacy 1-part base64 payloads in test environments only
    if (parts.length === 1 && process.env.NODE_ENV === 'test') {
      try {
        const decodedJson = Buffer.from(token, 'base64').toString('utf-8');
        const payload = JSON.parse(decodedJson);

        if (!payload.sub || !payload.email || !payload.role) {
          throw new InvalidTokenException('Invalid token payload');
        }

        (request as any).user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role as Role,
          tier: (payload.tier as SubscriptionTier) || SubscriptionTier.FREE,
        };

        return true;
      } catch {
        throw new InvalidTokenException('Invalid or expired authentication token');
      }
    }

    throw new InvalidTokenException('Invalid token format');
  }
}

