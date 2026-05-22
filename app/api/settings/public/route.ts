import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await serverClient.fetch(
      `*[_type == "siteSettings"][0] { activePaymentGateway, whatsappNumber }`
    )

    // Default to 'both' if not set
    const gateway = settings?.activePaymentGateway || 'both'
    const whatsappNumber = settings?.whatsappNumber || ''

    return NextResponse.json({ gateway, whatsappNumber })
  } catch (error) {
    console.error('Failed to fetch public settings:', error)
    // Default fallback
    return NextResponse.json({ gateway: 'both', whatsappNumber: '' })
  }
}
