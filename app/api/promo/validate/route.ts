import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import { cookies } from 'next/headers'
import { validateAndPricePromo } from '@/lib/promo'
import { verifyToken } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, cartTotal, products, items, customerEmail } = body

        // Prefer the logged-in user's email/id when available; fall back to the
        // email typed into the checkout form for guests.
        const token = cookies().get('auth-token')?.value
        const session = token ? await verifyToken(token).catch(() => null) : null
        const email = session?.email || customerEmail || null

        const result = await validateAndPricePromo({
            code,
            subtotal: cartTotal,
            productIds: products,
            items: Array.isArray(items)
                ? items.map((i: any) => ({ price: Number(i?.price) || 0, quantity: Number(i?.quantity) || 1 }))
                : undefined,
            email,
            userId: session?.userId || null,
        })

        if (!result.valid) {
            return NextResponse.json(result, { status: 400 })
        }

        // Preserve the legacy response shape (`promoCode`) the checkout reads.
        return NextResponse.json({
            valid: true,
            promoCode: result.code,
            description: result.description,
            discountType: result.discountType,
            discountValue: result.discountValue,
            discountAmount: result.discountAmount,
            freeShipping: result.freeShipping || false,
            message: result.message,
        })
    } catch (error) {
        console.error('Promo validation error:', error)
        return NextResponse.json(
            { valid: false, message: 'Failed to validate promo code' },
            { status: 500 }
        )
    }
}

// Increment usage count (called after successful checkout)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { code } = body

        if (!code) {
            return NextResponse.json({ error: 'Promo code required' }, { status: 400 })
        }

        // Fetch current promo
        const query = `*[_type == "promoCode" && code == $code][0] {
            _id,
            timesUsed
        }`

        const promo = await client.fetch(query, { code: code.toUpperCase() })

        if (!promo) {
            return NextResponse.json({ error: 'Promo code not found' }, { status: 404 })
        }

        // Increment usage count
        await client
            .patch(promo._id)
            .set({ timesUsed: (promo.timesUsed || 0) + 1 })
            .commit()

        return NextResponse.json({ success: true, message: 'Promo usage incremented' })
    } catch (error) {
        console.error('Promo increment error:', error)
        return NextResponse.json({ error: 'Failed to increment promo usage' }, { status: 500 })
    }
}
