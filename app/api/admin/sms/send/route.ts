import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FLASHSMS_API_URL = 'https://app.flashsms.africa/api/v1'

export async function POST(request: NextRequest) {
    try {
        const { phones, message } = await request.json()

        // Validate input
        if (!phones || !Array.isArray(phones) || phones.length === 0) {
            return NextResponse.json({ error: 'No phone numbers provided' }, { status: 400 })
        }

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: 'No message provided' }, { status: 400 })
        }

        const smsApiKey = process.env.FLASHSMS_API_KEY
        const smsSenderId = process.env.FLASHSMS_SENDER_ID || 'Sankofa'

        if (!smsApiKey) {
            return NextResponse.json(
                { error: 'SMS service not configured. Please add FLASHSMS_API_KEY to environment variables.' },
                { status: 500 }
            )
        }

        // Format phone numbers (accepts 0XXXXXXXXX or 233XXXXXXXXX format)
        const formattedPhones = phones.map((phone: string) => {
            let cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
            // Remove + prefix if present
            if (cleaned.startsWith('+')) {
                cleaned = cleaned.substring(1)
            }
            // If starts with 233, keep as is
            if (cleaned.startsWith('233')) {
                return cleaned
            }
            // If starts with 0, keep as is
            if (cleaned.startsWith('0')) {
                return cleaned
            }
            // If 9 digits, assume missing 0 prefix
            if (cleaned.length === 9) {
                return '0' + cleaned
            }
            return cleaned
        })

        const response = await fetch(`${FLASHSMS_API_URL}/sms/send`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${smsApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipients: formattedPhones,
                message: message.trim(),
                senderId: smsSenderId,
            }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
            console.error('FlashSMS API error:', data)
            return NextResponse.json({ error: data.error || 'Failed to send SMS' }, { status: response.status })
        }

        return NextResponse.json({
            success: true,
            sent: data.data?.recipientsSent || formattedPhones.length,
            failed: data.data?.invalidRecipients?.length || 0,
            message: 'SMS sent successfully',
            messageId: data.data?.messageId,
            creditsUsed: data.data?.creditsUsed,
            remainingCredits: data.data?.remainingCredits,
        })
    } catch (error: any) {
        console.error('SMS send error:', error)
        return NextResponse.json({ error: error.message || 'Failed to send SMS' }, { status: 500 })
    }
}
