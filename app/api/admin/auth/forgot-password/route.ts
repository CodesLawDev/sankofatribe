import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const BMS_API_URL = 'https://bms.codeslaw.dev/api/v1'

/**
 * POST /api/admin/auth/forgot-password
 * Body: { email?: string, phone?: string }
 * 
 * Generates a secure reset token, stores it with expiry in the user document,
 * and sends an SMS with the reset link to the user's phone.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json()

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or phone number is required' },
        { status: 400 }
      )
    }

    // Find user by email or phone
    let query = ''
    let params: any = {}

    if (email) {
      query = '*[_type == "user" && email == $email][0]'
      params = { email }
    } else if (phone) {
      // Normalize phone for search
      const normalizedPhone = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
      query = '*[_type == "user" && phone == $phone][0]'
      params = { phone: normalizedPhone }
    }

    const user = await serverClient.fetch<any>(query, params)

    if (!user) {
      // Don't reveal whether user exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      })
    }

    if (!user.isActive) {
      return NextResponse.json({
        error: 'Account is inactive. Contact administrator.',
      }, { status: 403 })
    }

    if (!user.phone) {
      return NextResponse.json({
        error: 'No phone number associated with this account. Contact administrator.',
      }, { status: 400 })
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in user document
    await serverClient
      .patch(user._id)
      .set({
        resetToken,
        resetTokenExpiry: resetTokenExpiry.toISOString(),
      })
      .commit()

    // Build reset link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const resetLink = `${siteUrl}/admin/reset-password?token=${resetToken}`

    // Send SMS with reset link
    const smsApiKey = process.env.BMS_API_KEY
    const smsSenderId = process.env.BMS_SENDER_ID || 'Sankofa'

    if (!smsApiKey) {
      console.error('BMS_API_KEY not configured')
      return NextResponse.json({
        error: 'SMS service not configured. Contact administrator.',
      }, { status: 500 })
    }

    // Format phone for BMS
    let formattedPhone = user.phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '')
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1)
    }

    const message = `SANKOFA TRIBE Admin: Reset your password using this link: ${resetLink} (Valid for 1 hour)`

    try {
      const smsResponse = await fetch(`${BMS_API_URL}/sms/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${smsApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: [formattedPhone],
          message,
          senderId: smsSenderId,
        }),
      })

      const smsData = await smsResponse.json()

      if (!smsResponse.ok || !smsData.success) {
        console.error('SMS send failed:', smsData)
        // Don't expose the error, but log it
        return NextResponse.json({
          success: true,
          message: 'If an account exists, a password reset link has been sent.',
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Password reset link sent via SMS.',
      })
    } catch (smsError) {
      console.error('SMS error:', smsError)
      // Don't expose the error
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a password reset link has been sent.',
      })
    }
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}
