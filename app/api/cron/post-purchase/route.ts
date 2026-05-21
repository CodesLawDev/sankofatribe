import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'
import { sendBrevoEmail } from '@/lib/brevo'

export const dynamic = 'force-dynamic'

const prisma = getPrisma()

/**
 * GET /api/cron/post-purchase
 * Cron job to send review requests 7 days after an order is placed.
 * Secured by CRON_SECRET header or query param.
 */
export async function GET(request: NextRequest) {
    try {
        const cronSecret = process.env.CRON_SECRET
        const authHeader = request.headers.get('authorization')
        const searchParams = new URL(request.url).searchParams
        // URL decoding replaces '+' with ' ', so we restore it for base64 strings if needed
        const querySecret = searchParams.get('secret')?.replace(/ /g, '+')

        if (
            (!authHeader || authHeader !== `Bearer ${cronSecret}`) &&
            querySecret !== cronSecret
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find orders placed exactly 7 days ago (between 7 and 8 days to catch all within the daily cron run)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)

        const eligibleOrders = await prisma.order.findMany({
            where: {
                followUpEmailSent: false,
                status: 'DELIVERED', // Only send if the order was delivered
                createdAt: {
                    lte: sevenDaysAgo,
                    gte: eightDaysAgo
                }
            },
            include: {
                user: true,
                items: true
            },
            take: 50
        })

        if (eligibleOrders.length === 0) {
            return NextResponse.json({ success: true, message: 'No eligible orders for follow-up' })
        }

        let sentCount = 0

        for (const order of eligibleOrders) {
            try {
                const name = order.user ? order.user.firstName : 'there'
                const email = order.customerEmail || order.user?.email

                if (!email) continue // Should not happen, but safety check

                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; max-w-xl; margin: 0 auto;">
                        <h2 style="color: #0e0c09;">How was your experience?</h2>
                        <p>Hi ${name},</p>
                        <p>It's been a week since you placed your order with Sankofa Tribe! We hope you're loving your new pieces.</p>
                        <p>We'd love to hear your thoughts. Your feedback helps us continue creating premium African heritage fashion and supports our community.</p>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://sankofatribe.com'}/leave-review?orderId=${order.id}" 
                               style="background-color: #0e0c09; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                                Leave a Review
                            </a>
                        </div>
                        <p style="margin-top: 30px; font-size: 12px; color: #666;">
                            If you have any issues with your order, please reply directly to this email and our team will help you right away.
                        </p>
                    </div>
                `

                const emailSent = await sendBrevoEmail({
                    to: [{ email, name }],
                    subject: 'How did we do? Tell us about your Sankofa Tribe order',
                    htmlContent
                })

                if (emailSent) {
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { followUpEmailSent: true }
                    })
                    sentCount++
                }
            } catch (err) {
                console.error(`Failed to process follow-up for order ${order.id}:`, err)
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${eligibleOrders.length} orders. Sent ${sentCount} follow-up emails.` 
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
