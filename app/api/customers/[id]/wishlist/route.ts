import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getPrisma } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic'

// GET wishlist for a customer
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

    // Users can only view their own wishlist
    if (payload.userId !== params.id && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const prisma = getPrisma();
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: params.id },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({ success: true, wishlistItems });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get wishlist' },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
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

    // Users can only add to their own wishlist
    if (payload.userId !== params.id && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if already in wishlist
    const prisma2 = getPrisma();
    const existing = await prisma2.wishlistItem.findUnique({
      where: { userId_productId: { userId: params.id, productId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Item already in wishlist' },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma2.wishlistItem.create({
      data: {
        userId: params.id,
        productId,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Added to wishlist', wishlistItem },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add to wishlist' },
      { status: 500 }
    );
  }
}
