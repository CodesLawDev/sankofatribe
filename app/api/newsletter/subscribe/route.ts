import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/auth-utils'
import { subscribeToBrevo } from '@/lib/brevo'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, firstName, lastName, phone, source = 'website' } = body

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const prisma = getPrisma()

        // 1. Sync to Brevo first (this is the source of truth for email marketing)
        const brevoContact = await subscribeToBrevo(email, firstName, lastName, phone)
        const mailchimpId = brevoContact?.id || undefined // Reuse the mailchimpId field to avoid Prisma schema migration just for this field rename

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
