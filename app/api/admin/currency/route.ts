import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/admin/currency
 * Update exchange rate (admin only - protected by middleware)
 * Body: { exchangeRate: number }
 */
export async function PUT(request: NextRequest) {
  try {
    const { exchangeRate } = await request.json()

    if (!exchangeRate || typeof exchangeRate !== 'number' || exchangeRate <= 0) {
      return NextResponse.json(
        { error: 'Valid exchangeRate (positive number) is required' },
        { status: 400 }
      )
    }

    // Get settings document
    const settings = await serverClient.fetch<any>(
      `*[_type == "siteSettings"][0]._id`
    )

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings document not found' },
        { status: 404 }
      )
    }

    // Update exchange rate and timestamp
    const updated = await serverClient
      .patch(settings)
      .set({
        'currency.exchangeRate': exchangeRate,
        'currency.lastUpdated': new Date().toISOString(),
      })
      .commit()

    return NextResponse.json({
      success: true,
      message: 'Exchange rate updated',
      exchangeRate: updated.currency?.exchangeRate,
      lastUpdated: updated.currency?.lastUpdated,
    })
  } catch (error) {
    console.error('Currency update error:', error)
    return NextResponse.json(
      { error: 'Failed to update exchange rate' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/currency
 * Fetch current exchange rate for admin (protected by middleware)
 */
export async function GET() {
  try {
    const settings = await serverClient.fetch<any>(
      `*[_type == "siteSettings"][0].currency`
    )

    if (!settings) {
      return NextResponse.json(
        {
          exchangeRate: 0.082,
          lastUpdated: new Date().toISOString(),
        }
      )
    }

    return NextResponse.json({
      exchangeRate: settings.exchangeRate || 0.082,
      lastUpdated: settings.lastUpdated,
    })
  } catch (error) {
    console.error('Currency fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate' },
      { status: 500 }
    )
  }
}
