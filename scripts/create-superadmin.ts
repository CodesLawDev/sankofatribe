import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    const email = 'admin@sankofatribe.com'
    const password = 'admin123'
    const firstName = 'Super'
    const lastName = 'Admin'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      if (existingUser.role !== 'SUPERADMIN') {
        // Update to SUPERADMIN
        await prisma.user.update({
          where: { email },
          data: { 
            role: 'SUPERADMIN',
            status: 'ACTIVE'
          }
        })
      } else {
      }
      
      process.exit(0)
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create superadmin user
    const superAdmin = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
        permissions: [
          'manage_users',
          'manage_orders',
          'manage_products',
          'manage_content',
          'manage_settings',
          'view_analytics',
          'manage_promotions',
          'manage_customers'
        ]
      }
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating superadmin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
