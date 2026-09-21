import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function bootstrapAdmin() {
  const emailArg = process.argv[2];
  const passwordArg = process.argv[3] || 'AdminBootstrapped123!';

  if (!emailArg) {
    console.error('Error: Email argument is required.');
    console.log('Usage: npm run bootstrap:admin -- <email> [password]');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  console.log(`Bootstrapping administrative privileges for: ${email}...`);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const updated = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: Role.ADMIN,
          twoFactorEnabled: true,
          isActive: true,
        },
      });

      console.log(`Success! Existing user ${updated.email} promoted to ADMIN with two-factor authentication enabled.`);
      console.log(`User ID: ${updated.id}`);
      console.log(`Role: ${updated.role}`);
      console.log(`2FA Enabled: ${updated.twoFactorEnabled}`);
    } else {
      const hashedPassword = await bcrypt.hash(passwordArg, 10);
      const created = await prisma.user.create({
        data: {
          email,
          firstName: 'System',
          lastName: 'Administrator',
          password: hashedPassword,
          role: Role.ADMIN,
          twoFactorEnabled: true,
          isActive: true,
        },
      });

      console.log(`Success! Created new administrator account: ${created.email}`);
      console.log(`User ID: ${created.id}`);
      console.log(`Role: ${created.role}`);
      console.log(`2FA Enabled: ${created.twoFactorEnabled}`);
      console.log(`Default Password: ${passwordArg}`);
    }
  } catch (error) {
    console.error('Failed to bootstrap administrator:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrapAdmin();
