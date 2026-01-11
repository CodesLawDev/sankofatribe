import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { subscribeToMailchimp } from '@/lib/mailchimp'
import { client as sanityClient } from '@/lib/sanity'

const prisma = new PrismaClient()

/**
 * POST /api/newsletter/subscribe
 * Subscribe user to newsletter
 *
 * Body:
 * {
 *   email: string (required)
 *   firstName?: string
 *   lastName?: string
 *   phone?: string
 *   source?: string (default: 'footer')
 *   smsOptIn?: boolean
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            email,
            firstName,
            lastName,
            phone,
            source = 'footer',
            smsOptIn = false,
        } = body

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Check if already subscribed
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email: normalizedEmail },
        })

        if (existing && existing.status === 'active') {
            return NextResponse.json(
                { error: 'Already subscribed', email: normalizedEmail },
                { status: 400 }
            )
        }

        // Get client IP and user agent
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        const userAgent = request.headers.get('user-agent') || undefined

        // Subscribe to Mailchimp
        let mailchimpId: string | null = null
        try {
            const mailchimpResponse = await subscribeToMailchimp({
                email_address: normalizedEmail,
                status: 'pending', // Requires email confirmation
                merge_fields: {
                    FNAME: firstName || '',
                    LNAME: lastName || '',
                    PHONE: phone || '',
                },
            })

            if (mailchimpResponse) {
                mailchimpId = mailchimpResponse.id
            }
        } catch (mailchimpError) {
            console.error('Mailchimp subscription failed:', mailchimpError)
            // Continue with local DB save even if Mailchimp fails
        }

        // Save to database
        const subscriber = existing
            ? await prisma.newsletterSubscriber.update({
                  where: { email: normalizedEmail },
                  data: {
                      firstName: firstName || existing.firstName,
                      lastName: lastName || existing.lastName,
                      phone: phone || existing.phone,
                      status: 'active',
                      confirmedAt: new Date(),
                      preferences: {
                          productUpdates: true,
                          offers: true,
                          smsOptIn: smsOptIn || false,
                      },
                      source,
                      ipAddress,
                      userAgent,
                      mailchimpId: mailchimpId || existing.mailchimpId,
                  },
              })
            : await prisma.newsletterSubscriber.create({
                  data: {
                      email: normalizedEmail,
                      firstName: firstName || null,
                      lastName: lastName || null,
                      phone: phone || null,
                      status: 'active',
                      subscribedAt: new Date(),
                      preferences: {
                          productUpdates: true,
                          offers: true,
                          smsOptIn: smsOptIn || false,
                      },
                      source,
                      ipAddress,
                      userAgent,
                      mailchimpId: mailchimpId || null,
                  },
              })

        // Create/update in Sanity
        try {
            await sanityClient.createIfNotExists({
                _type: 'newsletterSubscriber',
                _id: `subscriber-${normalizedEmail.replace(/[@.]/g, '-')}`,
                email: normalizedEmail,
                firstName: firstName || null,
                lastName: lastName || null,
                phone: phone || null,
                status: 'active',
                mailchimpId: mailchimpId || null,
                source: source,
                subscribedAt: new Date().toISOString(),
                confirmedAt: new Date().toISOString(),
            })
        } catch (sanityError) {
            console.error('Sanity sync failed:', sanityError)
            // Don't fail the entire request if Sanity fails
        }

        return NextResponse.json(
            {
                success: true,
                message: `Welcome to our newsletter, ${firstName || 'friend'}! Check your email to confirm your subscription.`,
                email: normalizedEmail,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Newsletter subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to process subscription. Please try again.' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/newsletter/subscribe?email=...
 * Check subscription status
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: email.toLowerCase() },
        })

        if (!subscriber) {
            return NextResponse.json({ subscribed: false }, { status: 200 })
        }

        return NextResponse.json(
            {
                subscribed: subscriber.status === 'active',
                status: subscriber.status,
                subscribedAt: subscriber.subscribedAt,
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('Newsletter status check error:', error)
        return NextResponse.json(
            { error: 'Failed to check subscription status' },
            { status: 500 }
        )
    }
}
