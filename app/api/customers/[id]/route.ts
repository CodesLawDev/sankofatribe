import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, prisma } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

// GET customer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Users can only view their own profile unless they're admin
    const isAdmin = payload.role === 'ADMIN';
    if (!isAdmin && payload.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        role: true,
        status: true,
        loyaltyPoints: true,
        totalOrders: true,
        totalSpent: true,
        createdAt: true,
        registeredAt: true,
        lastLogin: true,
        addresses: {
          select: {
            id: true,
            label: true,
            street: true,
            city: true,
            region: true,
            postalCode: true,
            country: true,
            isDefault: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

// PUT - Update customer profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Users can only update their own profile unless they're admin
    const isAdmin = payload.role === 'ADMIN';
    if (!isAdmin && payload.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { firstName, lastName, phone, bio, profileImage, preferences } = body;

    // Build update object - prevent changing email, role, password via this endpoint
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (preferences) {
      updateData.preferences = JSON.stringify(preferences);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        profileImage: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated',
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete customer account
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Users can only delete their own account
    if (payload.userId !== params.id && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete - set status to DELETED
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: 'DELETED' },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    // Clear auth cookie
    const cookieStore2 = cookies();
    cookieStore2.set('auth-token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted',
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
