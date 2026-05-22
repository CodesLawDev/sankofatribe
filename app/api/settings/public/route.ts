import { NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { getGatewayState } from '@/lib/payment-gateways'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [extra, gateways] = await Promise.all([
      serverClient.fetch<{ whatsappNumber?: string } | null>(
        `*[_type == "siteSettings"][0] { whatsappNumber }`
      ),
      getGatewayState(),
    ])

    return NextResponse.json({
      whatsappNumber: extra?.whatsappNumber || '',
      gateways: {
        productCheckout: {
          hubtelEnabled: gateways.productCheckout.hubtel.enabled,
          paystackEnabled: gateways.productCheckout.paystack.enabled,
        },
        ticketing: {
          hubtelEnabled: gateways.ticketing.hubtel.enabled,
          paystackEnabled: gateways.ticketing.paystack.enabled,
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch public settings:', error)
    return NextResponse.json({
      whatsappNumber: '',
      gateways: {
        productCheckout: { hubtelEnabled: true, paystackEnabled: false },
        ticketing: { hubtelEnabled: false, paystackEnabled: false },
      },
    })
  }
}
