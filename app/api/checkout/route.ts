import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
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

        // Create line items for Stripe
        const lineItems = items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `Size: ${item.selectedSize || 'N/A'}, Color: ${item.selectedColor || 'N/A'}`,
                    images: [item.image].filter(Boolean), // Add product image if available
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }))

        // Add shipping if applicable
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        if (subtotal < 100) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Shipping',
                        description: 'Standard shipping',
                        images: [],
                    },
                    unit_amount: 1000, // $10.00
                },
                quantity: 1,
            })
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
            customer_email: customer.email,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU'], // Add more countries as needed
            },
        })

        return NextResponse.json({ sessionId: session.id })
    } catch (error) {
        console.error('Error creating checkout session:', error)
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        )
    }
}
