import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as jwt from 'jose';

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

const JWT_SECRET = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is not set. Refusing to start with an insecure default.'
    )
  }
  return new TextEncoder().encode(secret)
})()

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create JWT token
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  const token = await new jwt.SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const verified = await jwt.jwtVerify(token, JWT_SECRET);
    const payload = verified.payload as any;
    
    // Ensure required fields exist
    if (payload.userId && payload.email && payload.role) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    }
    return null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Register new user (customer)
 */
export async function registerUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  phone?: string
) {
  const prisma = getPrisma();
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      firstName,
      lastName,
      passwordHash,
      phone: phone || null,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  return user;
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string) {
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.status === 'DELETED' || user.status === 'SUSPENDED') {
    throw new Error('Account is not active');
  }

  const passwordMatch = await comparePassword(password, user.passwordHash);

  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // Log login history
  await prisma.loginHistory.create({
    data: {
      userId: user.id,
      // You can capture IP and User Agent from request headers
    },
  });

  return user;
}

// Do not export a Prisma instance to avoid initializing during import/build
