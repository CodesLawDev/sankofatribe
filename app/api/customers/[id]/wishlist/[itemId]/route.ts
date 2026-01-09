import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, prisma } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

// DELETE - Remove item from wishlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
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

    // Users can only remove from their own wishlist
    if (payload.userId !== params.id && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify the item belongs to this user
    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: { id: params.itemId },
    });

    if (!wishlistItem || wishlistItem.userId !== params.id) {
      return NextResponse.json(
        { error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id: params.itemId },
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}
