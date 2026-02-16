import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth-utils';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@sankofatribe.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const passwordHash = await hashPassword('AdminPassword123!'); // Change this!
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sankofatribe.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash,
        phone: '+233201234567',
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        permissions: ['manage_users', 'manage_products', 'manage_orders', 'manage_settings'],
      },
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('📝 Please change password for:', admin.email);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
