import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        registeredAt: true,
        lastLogin: true,
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    console.log('\n📊 USER DATABASE REPORT');
    console.log('='.repeat(80));
    console.log(`Total Users: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ No users found in database.\n');
      return;
    }

    // Group by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, typeof users>);

    // Display by role
    for (const [role, roleUsers] of Object.entries(usersByRole)) {
      console.log(`\n🔐 ${role} USERS (${roleUsers.length})`);
      console.log('-'.repeat(80));
      
      roleUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Registered: ${user.registeredAt.toLocaleDateString()}`);
        console.log(`   Last Login: ${user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Query completed successfully\n');

  } catch (error) {
    console.error('❌ Error querying users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
