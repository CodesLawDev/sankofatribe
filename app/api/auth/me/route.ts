import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getPrisma } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      console.log('No token found in cookies');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    console.log('Token found, verifying...');

    // Verify token
    const payload = await verifyToken(token);

    if (!payload) {
      console.log('Token verification failed');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Token verified for user:', payload.userId);

    // Get full user data
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profileImage: true,
        role: true,
        status: true,
        permissions: true,
        loyaltyPoints: true,
        totalOrders: true,
        totalSpent: true,
        registeredAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      console.log('User not found in database:', payload.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found, returning data');

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}
