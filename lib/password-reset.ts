import crypto from 'crypto'
import { getPrisma, hashPassword } from '@/lib/auth-utils'
import { sendSMS } from '@/lib/sms-service'

const TOKEN_EXPIRY_MS = 60 * 60 * 1000

export function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateResetToken() {
  // 32 bytes => 64 hex chars (>= 8 chars required)
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = hashResetToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS)
  return { token, tokenHash, expiresAt }
}

export async function requestPasswordReset(options: {
  email?: string
  phone?: string
  role?: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN'
}) {
  const prisma = getPrisma()
  const normalizedEmail = typeof options.email === 'string' ? options.email.trim().toLowerCase() : ''
  const normalizedPhone = typeof options.phone === 'string' ? options.phone.trim() : ''

  const user = await prisma.user.findFirst({
    where: {
      ...(options.role ? { role: options.role } : {}),
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(normalizedPhone ? { phone: normalizedPhone } : {}),
    },
    select: { id: true, phone: true, status: true },
  })

  if (!user || user.status !== 'ACTIVE' || !user.phone) {
    return { success: true }
  }

  const { token, tokenHash, expiresAt } = generateResetToken()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: tokenHash,
      resetTokenExpiry: expiresAt,
    },
  })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const resetLink = `${siteUrl}/reset-password?token=${token}`
  const message = `SANKOFA TRIBE: Reset your password using this link: ${resetLink} (Valid for 1 hour)`

  await sendSMS(user.phone, message)

  return { success: true }
}

export async function validateResetToken(token: string, role?: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN') {
  if (!token || token.length < 8) {
    return { valid: false, error: 'Invalid token' }
  }

  const prisma = getPrisma()
  const tokenHash = hashResetToken(token)
  const user = await prisma.user.findFirst({
    where: {
      ...(role ? { role } : {}),
      resetToken: tokenHash,
    },
    select: { resetTokenExpiry: true },
  })

  if (!user) {
    return { valid: false, error: 'Invalid token' }
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { valid: false, error: 'Token has expired' }
  }

  return { valid: true }
}

export async function resetPasswordWithToken(options: {
  token: string
  password: string
  role?: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN'
}) {
  if (!options.token || options.token.length < 8) {
    return { success: false, error: 'Invalid token' }
  }

  const prisma = getPrisma()
  const tokenHash = hashResetToken(options.token)
  const user = await prisma.user.findFirst({
    where: {
      ...(options.role ? { role: options.role } : {}),
      resetToken: tokenHash,
    },
    select: { id: true, resetTokenExpiry: true },
  })

  if (!user) {
    return { success: false, error: 'Invalid or expired token' }
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { success: false, error: 'Token has expired' }
  }

  const passwordHash = await hashPassword(options.password)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return { success: true }
}
