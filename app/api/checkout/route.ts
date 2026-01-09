import { NextRequest, NextResponse } from 'next/server'
import { CartItem } from '@/lib/cart-context'

export async function POST(req: NextRequest) {
    try {
        const { items, customer } = await req.json() as {
            items: CartItem[]
            customer: {
                email: string
                firstName: string
                lastName: string
                address: string
                city: string
                postalCode: string
                country: string
            }
        }

        // Stripe has been removed from the project
        // In production, you would integrate with Paystack or another payment provider
        
        console.warn('Checkout attempted without payment provider configured. Install stripe to enable Stripe payments.')

        return NextResponse.json(
            {
                error: 'Payment processing is not configured. Please contact support.',
            },
            { status: 503 }
        )
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        )
    }
}
