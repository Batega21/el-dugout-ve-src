import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Subscriptions API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testEmail = `e2e-sub-${Date.now()}@example.com`;
  let createdSubscriptionId: string;

  let adminToken: string;

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

    // Login as seeded admin to obtain JWT
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin123!' });
    adminToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    if (createdSubscriptionId) {
      await prisma.subscription.deleteMany({
        where: { id: createdSubscriptionId },
      });
    }
    await app.close();
  });

  describe('POST /api/subscriptions', () => {
    it('should reject unauthenticated requests to create subscription with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/api/subscriptions')
        .send({ plan: 'premium' })
        .expect(401);
    });

    it('should create and persist a new subscription in PostgreSQL for authenticated user', async () => {
      const payload = {
        plan: 'premium',
        billingPeriod: 'annual',
        renewalConsent: true,
        termsAccepted: true,
      };

      const response = await request(app.getHttpServer())
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.plan).toBe('PREMIUM');
      expect(response.body.billingPeriod).toBe('ANNUAL');
      expect(response.body.status).toBe('TRIALING');
      expect(response.body.renewalConsent).toBe(true);
      expect(response.body.termsAccepted).toBe(true);

      createdSubscriptionId = response.body.id;

      // Verify row actually persisted in PostgreSQL via direct Prisma query
      const persisted = await prisma.subscription.findUnique({
        where: { id: createdSubscriptionId },
      });
      expect(persisted).toBeDefined();
      expect(persisted?.plan).toBe('PREMIUM');
      expect(persisted?.billingPeriod).toBe('ANNUAL');
    });

    it('should reject invalid payload with 400 Bad Request', async () => {
      const invalidPayload = {
        plan: 'INVALID_TIER',
      };

      await request(app.getHttpServer())
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPayload)
        .expect(400);
    });
  });

  describe('GET /api/subscriptions', () => {
    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/api/subscriptions')
        .expect(401);
    });

    it('should retrieve subscriptions filtered by email for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/subscriptions?email=${encodeURIComponent(testEmail)}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0].email).toBe(testEmail);
    });
  });

  describe('GET /api/subscriptions/:id', () => {
    it('should reject unauthenticated requests with 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`/api/subscriptions/${createdSubscriptionId}`)
        .expect(401);
    });

    it('should retrieve subscription by id for admin', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/subscriptions/${createdSubscriptionId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdSubscriptionId);
      expect(response.body.email).toBe(testEmail);
    });

    it('should return 404 for non-existent subscription UUID when admin requests', async () => {
      await request(app.getHttpServer())
        .get('/api/subscriptions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
