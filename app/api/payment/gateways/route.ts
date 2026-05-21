import { NextResponse } from 'next/server'
import { getGatewayState } from '@/lib/payment-gateways'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const state = await getGatewayState()
    return NextResponse.json(state)
  } catch (error) {
    console.error('[payment/gateways] error:', error)
    return NextResponse.json(
      { error: 'Failed to load payment gateway state' },
      { status: 500 }
    )
  }
}
