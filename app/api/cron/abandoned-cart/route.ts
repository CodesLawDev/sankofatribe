import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'
import { sendBrevoEmail } from '@/lib/brevo'

export const dynamic = 'force-dynamic'

const prisma = getPrisma()

/**
 * GET /api/cron/abandoned-cart
 * Cron job to send abandoned cart emails.
 * Secured by CRON_SECRET header or query param.
 */
export async function GET(request: NextRequest) {
    try {
        const cronSecret = process.env.CRON_SECRET
        const authHeader = request.headers.get('authorization')
        const searchParams = new URL(request.url).searchParams
        // URL decoding replaces '+' with ' ', so we restore it for base64 strings if needed
        const querySecret = searchParams.get('secret')?.replace(/ /g, '+')

        // Verify authorization
        if (
            (!authHeader || authHeader !== `Bearer ${cronSecret}`) &&
            querySecret !== cronSecret
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find carts that haven't been updated in 2 hours and haven't recovered or been sent an email
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const abandonedCarts = await prisma.abandonedCart.findMany({
            where: {
                recovered: false,
                emailSent: false,
                updatedAt: {
                    lte: twoHoursAgo,
                    gte: twentyFourHoursAgo
                }
            },
            take: 50
        })

        if (abandonedCarts.length === 0) {
            return NextResponse.json({ success: true, message: 'No abandoned carts to process' })
        }

        let sentCount = 0

        for (const cart of abandonedCarts) {
            try {
                const user = await prisma.user.findUnique({
                    where: { email: cart.email }
                })
                const name = user ? user.firstName : 'Friend'

                const cartItems = cart.cartData as any[]
                const itemsHtml = cartItems.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <strong>${item.name || item.productName || 'Item'}</strong><br/>
                            <small>Qty: ${item.quantity}</small>
                        </td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                            GHS ${item.price}
                        </td>
                    </tr>
                `).join('')

                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto;">
                        <h2 style="color: #0e0c09;">You left something behind!</h2>
                        <p>Hi ${name},</p>
                        <p>We noticed you left some items in your cart. We've saved them for you, but they might sell out soon!</p>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                            ${itemsHtml}
                            <tr>
                                <td style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 10px; text-align: right; font-weight: bold;">GHS ${cart.totalValue}</td>
                            </tr>
                        </table>
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com'}/checkout" 
                               style="background-color: #0e0c09; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                Complete Your Order
                            </a>
                        </div>
                    </div>
                `

                const emailSent = await sendBrevoEmail({
                    to: [{ email: cart.email, name }],
                    subject: 'You left something in your cart',
                    htmlContent
                })

                if (emailSent) {
                    await prisma.abandonedCart.update({
                        where: { id: cart.id },
                        data: { emailSent: true }
                    })
                    sentCount++
                }
            } catch (err) {
                console.error(`Failed to process cart ${cart.id}:`, err)
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${abandonedCarts.length} carts. Sent ${sentCount} emails.` 
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
