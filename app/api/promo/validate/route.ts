import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'
import type { PromoCode } from '@/lib/sanity'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { code, cartTotal, products, customerEmail, isFirstTimeCustomer } = body

        // Validate input
        if (!code || typeof code !== 'string') {
            return NextResponse.json({ valid: false, message: 'Invalid promo code' }, { status: 400 })
        }

        if (typeof cartTotal !== 'number' || cartTotal < 0) {
            return NextResponse.json({ valid: false, message: 'Invalid cart total' }, { status: 400 })
        }

        // Fetch promo code from Sanity
        const query = `*[_type == "promoCode" && code == $code][0] {
            _id,
            code,
            description,
            discountType,
            discountValue,
            minimumPurchase,
            maxDiscount,
            usageLimit,
            usageLimitPerCustomer,
            timesUsed,
            validFrom,
            validUntil,
            isActive,
            firstTimeCustomerOnly,
            "applicableProducts": applicableProducts[]->_id,
            "applicableCategories": applicableCategories[]->_id
        }`

        const promo = await client.fetch<PromoCode | null>(query, { code: code.toUpperCase() })

        // Check if promo code exists
        if (!promo) {
            return NextResponse.json({ valid: false, message: 'Invalid promo code' }, { status: 404 })
        }

        // Check if active
        if (!promo.isActive) {
            return NextResponse.json({ valid: false, message: 'This promo code is no longer active' }, { status: 400 })
        }

        // Check date validity
        const now = new Date()
        const validFrom = new Date(promo.validFrom)
        const validUntil = new Date(promo.validUntil)

        if (now < validFrom) {
            return NextResponse.json(
                {
                    valid: false,
                    message: `This promo code is not yet active. Valid from ${validFrom.toLocaleDateString()}`,
                },
                { status: 400 }
            )
        }

        if (now > validUntil) {
            return NextResponse.json(
                { valid: false, message: 'This promo code has expired' },
                { status: 400 }
            )
        }

        // Check usage limit
        if (promo.usageLimit && promo.usageLimit > 0 && (promo.timesUsed || 0) >= promo.usageLimit) {
            return NextResponse.json(
                { valid: false, message: 'This promo code has reached its usage limit' },
                { status: 400 }
            )
        }

        // Check per-customer usage limit (would need customer tracking in production)
        // For now, we'll skip this check as it requires order history lookup
        // In production: query orders for this customer + promo code combo

        // Check minimum purchase
        if (promo.minimumPurchase && cartTotal < promo.minimumPurchase) {
            return NextResponse.json(
                {
                    valid: false,
                    message: `Minimum purchase of ₵${promo.minimumPurchase} required for this promo code`,
                },
                { status: 400 }
            )
        }

        // Check first-time customer restriction
        if (promo.firstTimeCustomerOnly && !isFirstTimeCustomer) {
            return NextResponse.json(
                { valid: false, message: 'This promo code is only valid for first-time customers' },
                { status: 400 }
            )
        }

        // Check product applicability
        if (promo.applicableProducts && promo.applicableProducts.length > 0) {
            const applicableProductIds = promo.applicableProducts.map(p => p._id)
            const hasApplicableProduct = products?.some((productId: string) =>
                applicableProductIds.includes(productId)
            )

            if (!hasApplicableProduct) {
                return NextResponse.json(
                    {
                        valid: false,
                        message: 'This promo code is not applicable to any products in your cart',
                    },
                    { status: 400 }
                )
            }
        }

        // Check category applicability (would require product category info)
        if (promo.applicableCategories && promo.applicableCategories.length > 0) {
            // In production: fetch product categories and check overlap
            // For now, we'll allow it through if categories are specified
        }

        // Calculate discount
        let discountAmount = 0

        if (promo.discountType === 'percentage') {
            discountAmount = (cartTotal * (promo.discountValue || 0)) / 100

            // Apply max discount cap if specified
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
                discountAmount = promo.maxDiscount
            }
        } else if (promo.discountType === 'fixed') {
            discountAmount = promo.discountValue || 0

            // Don't let discount exceed cart total
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal
            }
        } else if (promo.discountType === 'free_shipping') {
            // Free shipping - discount amount is 0 for cart total, but flag is set
            discountAmount = 0
        }

        // Return success response
        return NextResponse.json({
            valid: true,
            promoCode: promo.code,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue,
            discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimals
            freeShipping: promo.discountType === 'free_shipping',
            message: 'Promo code applied successfully',
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
