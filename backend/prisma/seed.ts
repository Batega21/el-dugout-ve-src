import { PrismaClient, Role, SubscriptionTier, SubscriptionStatus, BillingPeriod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const defaultPassword = await bcrypt.hash('Password123!', 10);
  const adminPassword = await bcrypt.hash('Admin123!', 10);

  // 1. Admin User (2FA enabled, no subscription)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      firstName: 'System',
      lastName: 'Administrator',
      twoFactorEnabled: true,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@example.com',
      firstName: 'System',
      lastName: 'Administrator',
      password: adminPassword,
      role: Role.ADMIN,
      twoFactorEnabled: true,
      isActive: true,
      projects: {
        create: [
          {
            title: 'Sample Cloud SQL Migration',
            description: 'Demonstrating Cloud SQL connected via Prisma with NestJS.',
            isPublic: true,
          },
          {
            title: 'Angular 19 Modern Dashboard',
            description: 'Demonstrating responsive standalone signals-based UI.',
            isPublic: true,
          },
        ],
      },
    },
  });
  console.log(`Seeded default admin user: ${adminUser.email}`);

  // 2. Free Tier User (No paid subscription)
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@example.com' },
    update: {
      firstName: 'Free',
      lastName: 'Tier User',
    },
    create: {
      email: 'free@example.com',
      firstName: 'Free',
      lastName: 'Tier User',
      password: defaultPassword,
      role: Role.USER,
      isActive: true,
    },
  });
  console.log(`Seeded free user: ${freeUser.email}`);

  // 3. Basic Plan Subscriber
  const basicUser = await prisma.user.upsert({
    where: { email: 'basic@example.com' },
    update: {
      firstName: 'Basic',
      lastName: 'Subscriber',
      mobileNumber: '555-010-0001',
    },
    create: {
      email: 'basic@example.com',
      firstName: 'Basic',
      lastName: 'Subscriber',
      mobileNumber: '555-010-0001',
      password: defaultPassword,
      role: Role.USER,
      isActive: true,
      subscription: {
        create: {
          plan: SubscriptionTier.BASIC,
          billingPeriod: BillingPeriod.MONTHLY,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    },
  });
  console.log(`Seeded basic user: ${basicUser.email}`);

  // 4. Premium Plan Subscriber
  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@example.com' },
    update: {
      firstName: 'Premium',
      lastName: 'Subscriber',
      mobileNumber: '555-010-0002',
    },
    create: {
      email: 'premium@example.com',
      firstName: 'Premium',
      lastName: 'Subscriber',
      mobileNumber: '555-010-0002',
      password: defaultPassword,
      role: Role.USER,
      isActive: true,
      subscription: {
        create: {
          plan: SubscriptionTier.PREMIUM,
          billingPeriod: BillingPeriod.ANNUAL,
          status: SubscriptionStatus.ACTIVE,
        },
      },
    },
  });
  console.log(`Seeded premium user: ${premiumUser.email}`);
}

main()
  .catch((e) => {
    console.error('Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

