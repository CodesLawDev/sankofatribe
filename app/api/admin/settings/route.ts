import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

export async function GET(request: NextRequest) {
  try {
    const settings = await serverClient.fetch(
      `*[_type == "siteSettings"][0] {
        _id,
        siteName,
        description,
        adminPhone,
        senderId,
        currency {
          defaultCurrency,
          exchangeRate,
          lastUpdated
        },
        paymentGateways {
          hubtelEnabled,
          paystackEnabled,
          defaultGateway
        },
        geoLocation {
          ghanaCurrencyCountries,
          defaultCountry
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
    const { _id, siteName, description, adminPhone, senderId, currency, paymentGateways, geoLocation } = body

    // Validate: at least one gateway must be enabled
    if (paymentGateways) {
      const { hubtelEnabled, paystackEnabled, defaultGateway } = paymentGateways
      if (!hubtelEnabled && !paystackEnabled) {
        return NextResponse.json(
          { error: 'At least one payment gateway must be enabled' },
          { status: 400 }
        )
      }
      if (defaultGateway === 'hubtel' && !hubtelEnabled) {
        return NextResponse.json(
          { error: 'Default gateway "hubtel" cannot be set while Hubtel is disabled' },
          { status: 400 }
        )
      }
      if (defaultGateway === 'paystack' && !paystackEnabled) {
        return NextResponse.json(
          { error: 'Default gateway "paystack" cannot be set while Paystack is disabled' },
          { status: 400 }
        )
      }
    }

    const updated = await serverClient
      .patch(_id)
      .set({
        siteName,
        description,
        adminPhone,
        senderId,
        currency: {
          ...currency,
          lastUpdated: new Date().toISOString(),
        },
        ...(paymentGateways && { paymentGateways }),
        geoLocation,
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
