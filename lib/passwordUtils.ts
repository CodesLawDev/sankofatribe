import crypto from 'crypto'

/**
 * Hash a password using PBKDF2 (Node.js built-in, no bcrypt dependency needed)
 * In production, consider using bcrypt: npm install bcrypt
 */
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex')
  const hash = crypto
    .pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512')
    .toString('hex')
  
  return {
    hash: `${actualSalt}:${hash}`,
    salt: actualSalt,
  }
}

/**
 * Verify a password against a stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':')
    if (!salt || !hash) return false
    
    const { hash: newHash } = hashPassword(password, salt)
    const [, computedHash] = newHash.split(':')
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(computedHash)
    )
  } catch {
    return false
  }
}

/**
 * Generate a temporary password for new users
 */
export function generateTemporaryPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}
