import { NextRequest, NextResponse } from 'next/server'
import { CartItem } from '@/lib/cart-context'

export async function POST(req: NextRequest) {
    try {
        const { reference, customer, items } = await req.json() as {
            reference: string
            customer: {
                email: string
                firstName: string
                lastName: string
                address: string
                city: string
                postalCode: string
                country: string
            }
            items: CartItem[]
        }

        // Verify payment with Paystack
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY

        if (!paystackSecretKey) {
            return NextResponse.json(
                { error: 'Paystack secret key not configured' },
                { status: 500 }
            )
        }

        const verifyResponse = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${paystackSecretKey}`,
                },
            }
        )

        const verificationData = await verifyResponse.json()

        if (verificationData.status && verificationData.data.status === 'success') {
            // Payment verified successfully

            // TODO: Save order to database
            // TODO: Send confirmation email to customer
            // TODO: Update inventory

            const orderData = {
                reference,
                customer,
                items,
                amount: verificationData.data.amount / 100, // Convert from kobo to naira
                status: 'paid',
                paymentMethod: 'paystack',
                createdAt: new Date().toISOString(),
            }

            return NextResponse.json({
                success: true,
                message: 'Payment verified successfully',
                order: orderData,
            })
        } else {
            return NextResponse.json(
                { error: 'Payment verification failed' },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Error verifying payment:', error)
        return NextResponse.json(
            { error: 'Error verifying payment' },
            { status: 500 }
        )
    }
}
