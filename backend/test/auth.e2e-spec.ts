import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { Role, SubscriptionTier, SubscriptionStatus } from '@prisma/client';

describe('RBAC & Subscription Entitlements (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const adminEmail = `e2e-admin-${Date.now()}@example.com`;
  const freeUserEmail = `e2e-free-${Date.now()}@example.com`;
  const premiumUserEmail = `e2e-premium-${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let adminToken: string;
  let freeUserToken: string;
  let premiumUserToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);

    const hashedPassword = await bcrypt.hash(testPassword, 10);

    // 1. Seed admin user (role: ADMIN, no subscription, 2FA enabled)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'E2E',
        lastName: 'Admin',
        role: Role.ADMIN,
        twoFactorEnabled: true,
        isActive: true,
      },
    });

    // 2. Seed free user (role: USER, no subscription)
    await prisma.user.create({
      data: {
        email: freeUserEmail,
        password: hashedPassword,
        firstName: 'E2E',
        lastName: 'Free User',
        role: Role.USER,
        twoFactorEnabled: false,
        isActive: true,
      },
    });

    // 3. Seed premium user (role: USER, active PREMIUM subscription)
    const premiumUser = await prisma.user.create({
      data: {
        email: premiumUserEmail,
        password: hashedPassword,
        firstName: 'E2E',
        lastName: 'Premium User',
        role: Role.USER,
        twoFactorEnabled: false,
        isActive: true,
        subscription: {
          create: {
            plan: SubscriptionTier.PREMIUM,
            status: SubscriptionStatus.ACTIVE,
          },
        },
      },
    });

    // Obtain tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: adminEmail, password: testPassword });
    adminToken = adminLogin.body.accessToken;

    const freeLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: freeUserEmail, password: testPassword });
    freeUserToken = freeLogin.body.accessToken;

    const premiumLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: premiumUserEmail, password: testPassword });
    premiumUserToken = premiumLogin.body.accessToken;
  });

  afterAll(async () => {
    await prisma.subscription.deleteMany({
      where: {
        user: { email: { in: [adminEmail, freeUserEmail, premiumUserEmail] } },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            adminEmail,
            freeUserEmail,
            premiumUserEmail,
            'attacker@example.com',
            'legit-signup@example.com',
          ],
        },
      },
    });
    await app.close();
  });

  describe('1. Privilege Escalation & DTO Audit', () => {
    it('should reject registration requests containing injected role property', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'Attacker',
          lastName: 'User',
          email: 'attacker@example.com',
          password: 'Password123!',
          role: 'ADMIN',
        })
        .expect(400);
    });

    it('should reject registration requests containing injected tier property', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'Attacker',
          lastName: 'User',
          email: 'attacker@example.com',
          password: 'Password123!',
          tier: 'PREMIUM',
        })
        .expect(400);
    });

    it('should reject spoofed Google IAM header access attempts with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('x-goog-authenticated-user-email', 'accounts.google.com:admin@example.com')
        .expect(401);
    });

    it('should successfully register standard user with default USER role and FREE tier', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          firstName: 'Legit',
          lastName: 'User',
          email: 'legit-signup@example.com',
          password: 'Password123!',
        })
        .expect(201);

      expect(res.body.user.role).toBe(Role.USER);
      expect(res.body.user.tier).toBe(SubscriptionTier.FREE);
    });
  });

  describe('2. Role-Based Access Control (Admin Protection)', () => {
    it('should deny regular user from accessing user management /api/users (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should deny regular user from accessing subscription tables /api/subscriptions (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/subscriptions')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should deny regular user from accessing system metrics /api/health/metrics (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/health/metrics')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should allow admin user to access user management /api/users (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should allow admin user to access subscription tables /api/subscriptions (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should allow admin user to access system metrics /api/health/metrics (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/health/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('healthy');
      expect(res.body.businessTelemetry).toBeDefined();
    });
  });

  describe('3. Subscription Entitlement & Admin Bypass', () => {
    it('should deny free-tier user from accessing premium feature route (403)', async () => {
      await request(app.getHttpServer())
        .get('/api/features/premium')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should allow paying premium subscriber to access premium feature route (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/features/premium')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      expect(res.body.accessGranted).toBe(true);
      expect(res.body.tier).toBe('PREMIUM');
    });

    it('should allow admin to access premium feature route regardless of subscription (200 bypass)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/features/premium')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.accessGranted).toBe(true);
    });
  });

  describe('4. Health Probe Public Access', () => {
    it('should keep /api/health probe accessible without authentication (200)', async () => {
      await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);
    });
  });
});
