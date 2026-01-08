import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

export async function GET(request: NextRequest) {
  try {
    const settings = await serverClient.fetch(
      `*[_type == "siteSettings"][0] {
        _id,
        siteName,
        adminPhone,
        senderId,
        currency {
          defaultCurrency,
          exchangeRate,
          lastUpdated
        }
      }`
    )

    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Admin settings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { _id, siteName, adminPhone, senderId, currency } = body

    // Update settings in Sanity
    const updated = await serverClient
      .patch(_id)
      .set({
        siteName,
        adminPhone,
        senderId,
        currency: {
          ...currency,
          lastUpdated: new Date().toISOString(),
        },
      })
      .commit()

    return NextResponse.json({
      message: 'Settings updated successfully',
      data: updated,
    })
  } catch (error) {
    console.error('Admin settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
