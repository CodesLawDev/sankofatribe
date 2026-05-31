import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'
import { subscribeToBrevo, sendBrevoEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email: rawEmail, firstName, lastName, phone, source = 'website' } = body

        if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // Store a canonical, lowercased email so subscriber lookups (e.g. the
        // SANKOFA007 subscribers-only gate) match regardless of how the user
        // typed it. Lowercasing is always deliverable; we deliberately do NOT
        // strip +tags here to avoid changing the real destination mailbox.
        const email = rawEmail.trim().toLowerCase()

        const prisma = getPrisma()

        // 1. Sync to Brevo first (this is the source of truth for email marketing)
        const brevoContact = await subscribeToBrevo(email, firstName, lastName, phone)
        const mailchimpId = brevoContact?.id || undefined // Reuse the mailchimpId field to avoid Prisma schema migration just for this field rename

        // Check if subscriber already exists so we only send welcome email once
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email }
        })

        // 2. Save to internal database
        // Use upsert to handle both new subscriptions and updates to existing ones
        const subscriber = await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phone: phone || undefined,
                status: 'active',
                source,
                mailchimpId,
                updatedAt: new Date()
            },
            create: {
                email,
                firstName,
                lastName,
                phone,
                source,
                status: 'active',
                mailchimpId,
                ipAddress: request.headers.get('x-forwarded-for') || undefined,
                userAgent: request.headers.get('user-agent') || undefined,
            }
        })

        // 3. Send Welcome Email if new subscriber
        if (!existingSubscriber) {
            const htmlContent = `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #333333;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #000000; font-size: 28px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 2px;">Welcome to the Tribe!</h1>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        ${firstName ? `Hi ${firstName},` : 'Hello!'}
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        Thank you for subscribing to the Sankofa Tribe newsletter. We are thrilled to have you join our community of premium fashion lovers.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        As promised, here is your 10% off discount code for your first order:
                    </p>
                    
                    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0;">
                        <strong style="font-size: 28px; font-family: monospace; letter-spacing: 4px; color: #000000;">SANKOFA007</strong>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                        Apply this code at checkout to claim your discount.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                        Stay tuned for new drops, exclusive sales, and behind-the-scenes looks at our collections.
                    </p>
                    
                    <div style="border-top: 1px solid #e5e7eb; padding-top: 32px;">
                        <p style="font-size: 14px; color: #6b7280; margin: 0;">
                            Best regards,<br/>
                            <strong style="color: #000000;">Sankofa Tribe Team</strong>
                        </p>
                    </div>
                </div>
            `

            await sendBrevoEmail({
                to: [{ email, name: firstName ? `${firstName} ${lastName || ''}`.trim() : undefined }],
                subject: 'Welcome to Sankofa Tribe! Your 10% Discount Code Inside 🎉',
                htmlContent
            })
        }

        return NextResponse.json({
            success: true,
            subscriber: {
                id: subscriber.id,
                email: subscriber.email
            }
        })

    } catch (error) {
        console.error('Newsletter subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to subscribe to newsletter' },
            { status: 500 }
        )
    }
}
