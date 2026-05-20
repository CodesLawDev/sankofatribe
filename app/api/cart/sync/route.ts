import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'

const prisma = getPrisma()

/**
 * POST /api/cart/sync
 * Syncs the user's cart from the frontend so we can track abandoned carts.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, cartData, totalValue } = body

        if (!email || !cartData || !Array.isArray(cartData)) {
            return NextResponse.json({ error: 'Email and cart data are required' }, { status: 400 })
        }

        // If the cart is empty, they either cleared it or completed purchase.
        if (cartData.length === 0) {
            await prisma.abandonedCart.updateMany({
                where: { email, recovered: false },
                data: { recovered: true }
            })
            return NextResponse.json({ success: true, message: 'Cart cleared/recovered' })
        }

        // Check if an active abandoned cart exists for this email
        const existingCart = await prisma.abandonedCart.findFirst({
            where: { email, recovered: false, emailSent: false },
            orderBy: { updatedAt: 'desc' }
        })

        if (existingCart) {
            await prisma.abandonedCart.update({
                where: { id: existingCart.id },
                data: {
                    cartData,
                    totalValue: totalValue || 0,
                    updatedAt: new Date()
                }
            })
        } else {
            await prisma.abandonedCart.create({
                data: {
                    email,
                    cartData,
                    totalValue: totalValue || 0,
                }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error syncing cart:', error)
        return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 })
    }
}
