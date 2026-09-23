import { PrismaClient, Role, SubscriptionTier, SubscriptionStatus, BillingPeriod, StatCategory } from '@prisma/client';
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

  // ---------------------------------------------------------------------------
  // 5. LVBP Historical Records & Season Leaders
  // ---------------------------------------------------------------------------
  console.log('Seeding historical LVBP top records...');

  // Teams
  const zulia = await prisma.team.upsert({
    where: { name: 'Águilas del Zulia' },
    update: {},
    create: { name: 'Águilas del Zulia', abbreviation: 'ZUL' },
  });
  const gavilanes = await prisma.team.upsert({
    where: { name: 'Gavilanes BBC' },
    update: {},
    create: { name: 'Gavilanes BBC', abbreviation: 'GAV' },
  });
  const caracas = await prisma.team.upsert({
    where: { name: 'Leones del Caracas' },
    update: {},
    create: { name: 'Leones del Caracas', abbreviation: 'CAR' },
  });
  const lara = await prisma.team.upsert({
    where: { name: 'Cardenales de Lara' },
    update: {},
    create: { name: 'Cardenales de Lara', abbreviation: 'LAR' },
  });

  // Players
  const aliCastillo = await prisma.player.upsert({
    where: { slug: 'ali-castillo' },
    update: { fullName: 'Alí Castillo' },
    create: { fullName: 'Alí Castillo', slug: 'ali-castillo' },
  });
  const emilioCueche = await prisma.player.upsert({
    where: { slug: 'emilio-cueche' },
    update: { fullName: 'Emilio Cueche' },
    create: { fullName: 'Emilio Cueche', slug: 'emilio-cueche' },
  });
  const felixRodriguez = await prisma.player.upsert({
    where: { slug: 'felix-rodriguez' },
    update: { fullName: 'Félix Rodríguez' },
    create: { fullName: 'Félix Rodríguez', slug: 'felix-rodriguez' },
  });
  const luisSojo = await prisma.player.upsert({
    where: { slug: 'luis-sojo' },
    update: { fullName: 'Luis Sojo' },
    create: { fullName: 'Luis Sojo', slug: 'luis-sojo' },
  });

  // Seasons
  const s2020 = await prisma.season.upsert({
    where: { code: '2020-21' },
    update: {},
    create: { code: '2020-21', startYear: 2020, endYear: 2021 },
  });
  const s1953 = await prisma.season.upsert({
    where: { code: '1953-54' },
    update: {},
    create: { code: '1953-54', startYear: 1953, endYear: 1954 },
  });
  const s1976 = await prisma.season.upsert({
    where: { code: '1976-77' },
    update: {},
    create: { code: '1976-77', startYear: 1976, endYear: 1977 },
  });

  // Sojo Batting Title Seasons
  const sojoSeasons = [
    { code: '1989-90', startYear: 1989, endYear: 1990, avg: 0.351 },
    { code: '1990-91', startYear: 1990, endYear: 1991, avg: 0.359 },
    { code: '1993-94', startYear: 1993, endYear: 1994, avg: 0.375 },
    { code: '1994-95', startYear: 1994, endYear: 1995, avg: 0.376 },
    { code: '1998-99', startYear: 1998, endYear: 1999, avg: 0.356 },
    { code: '1999-00', startYear: 1999, endYear: 2000, avg: 0.364 },
  ];

  // 1. Récord AVG: .430 — Alí Castillo 2020-21
  await prisma.seasonLeader.upsert({
    where: {
      season_player_category: {
        seasonId: s2020.id,
        playerId: aliCastillo.id,
        category: StatCategory.BATTING_AVERAGE,
      },
    },
    update: { statValue: 0.430 },
    create: {
      seasonId: s2020.id,
      playerId: aliCastillo.id,
      teamId: zulia.id,
      teamRaw: 'Águilas del Zulia',
      category: StatCategory.BATTING_AVERAGE,
      statValue: 0.430,
    },
  });

  // 2. Récord Innings: 208.0 — Emilio Cueche 1953-54
  await prisma.seasonLeader.upsert({
    where: {
      season_player_category: {
        seasonId: s1953.id,
        playerId: emilioCueche.id,
        category: StatCategory.INNINGS_PITCHED,
      },
    },
    update: { statValue: 208.000 },
    create: {
      seasonId: s1953.id,
      playerId: emilioCueche.id,
      teamId: gavilanes.id,
      teamRaw: 'Gavilanes BBC',
      category: StatCategory.INNINGS_PITCHED,
      statValue: 208.000,
    },
  });

  // 3. Récord Triples: 10 — Félix Rodríguez 1976-77
  await prisma.seasonLeader.upsert({
    where: {
      season_player_category: {
        seasonId: s1976.id,
        playerId: felixRodriguez.id,
        category: StatCategory.TRIPLES,
      },
    },
    update: { statValue: 10.000 },
    create: {
      seasonId: s1976.id,
      playerId: felixRodriguez.id,
      teamId: caracas.id,
      teamRaw: 'Leones del Caracas',
      category: StatCategory.TRIPLES,
      statValue: 10.000,
    },
  });

  // 4. Más títulos bateo: 6x — Luis Sojo
  for (const s of sojoSeasons) {
    const seasonRecord = await prisma.season.upsert({
      where: { code: s.code },
      update: {},
      create: { code: s.code, startYear: s.startYear, endYear: s.endYear },
    });

    await prisma.seasonLeader.upsert({
      where: {
        season_player_category: {
          seasonId: seasonRecord.id,
          playerId: luisSojo.id,
          category: StatCategory.BATTING_AVERAGE,
        },
      },
      update: { statValue: s.avg },
      create: {
        seasonId: seasonRecord.id,
        playerId: luisSojo.id,
        teamId: lara.id,
        teamRaw: 'Cardenales de Lara',
        category: StatCategory.BATTING_AVERAGE,
        statValue: s.avg,
      },
    });
  }

  console.log('Successfully seeded historical LVBP top records.');
}

main()
  .catch((e) => {
    console.error('Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

