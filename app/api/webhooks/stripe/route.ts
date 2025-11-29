import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = headers().get('stripe-signature')!

    let event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Webhook Error' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object

            // TODO: Save order to database
            // TODO: Send confirmation email
            // TODO: Update inventory

            console.log('Payment successful:', session)
            break

        case 'payment_intent.payment_failed':
            const paymentIntent = event.data.object
            console.log('Payment failed:', paymentIntent)
            break

        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
}
