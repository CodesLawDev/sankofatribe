import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, prisma } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

// GET addresses for a customer
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

    // Users can only view their own addresses
    if (payload.userId !== params.id && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get addresses' },
      { status: 500 }
    );
  }
}

// POST - Create new address for customer
export async function POST(
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

    // Users can only add addresses to their own account
    if (payload.userId !== params.id && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { label, street, city, region, postalCode, country, isDefault } = body;

    // Validation
    if (!street || !city || !country) {
      return NextResponse.json(
        { error: 'Street, city, and country are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: params.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: params.id,
        label: label || 'Address',
        street,
        city,
        region,
        postalCode,
        country,
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Address added', address },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create address' },
      { status: 500 }
    );
  }
}
