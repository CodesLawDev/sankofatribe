import crypto from 'crypto'
import { getPrisma, hashPassword } from '@/lib/auth-utils'

export interface CustomerData {
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: {
    street?: string
    city?: string
    region?: string
    country?: string
  }
}

export interface FindOrCreateResult {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
  }
  created: boolean
}

/**
 * Find an existing customer by email or create a new one (idempotent).
 *
 * When a new customer is created via a purchase attempt a random secure
 * password is assigned so the customer can claim their account later through
 * the password-reset flow.  The creation event is logged to stdout for
 * auditing purposes.
 */
export async function findOrCreateCustomer(
  data: CustomerData
): Promise<FindOrCreateResult> {
  const prisma = getPrisma()
  const email = data.email.toLowerCase().trim()

  // 1. Check if the customer already exists
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true, lastName: true },
  })

  if (existing) {
    return { user: existing, created: false }
  }

  // 2. Assign a random password — the customer does not know it and can
  //    set their own via the forgot-password / password-reset flow at any
  //    time.  The value is never returned or exposed; it exists only to
  //    satisfy the non-nullable `passwordHash` column.
  const randomPassword = crypto.randomBytes(32).toString('hex')
  const passwordHash = await hashPassword(randomPassword)

  // 3. Create the customer record
  const user = await prisma.user.create({
    data: {
      email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      phone: data.phone?.trim() || null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
    select: { id: true, email: true, firstName: true, lastName: true },
  })

  // 4. Persist the shipping address when one is supplied
  if (data.address?.city || data.address?.street) {
    await prisma.address
      .create({
        data: {
          userId: user.id,
          street: data.address.street || '',
          city: data.address.city || '',
          region: data.address.region || null,
          country: data.address.country || 'Ghana',
          isDefault: true,
        },
      })
      .catch((err) =>
        console.error('[customer-service] Failed to create address:', err)
      )
  }

  // 5. Audit log — captured by any structured-logging sink (Datadog, CloudWatch, etc.)
  console.log(
    JSON.stringify({
      event: 'customer_created',
      timestamp: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      trigger: 'purchase_attempt',
    })
  )

  return { user, created: true }
}
