import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { convertGHSToUSD, convertUSDToGHS } from '@/lib/currency'

export const dynamic = 'force-dynamic'

/**
 * GET /api/currency
 * Fetch current exchange rate and currency settings
 */
export async function GET(request: NextRequest) {
  try {
    const settings = await serverClient.fetch<any>(
      `*[_type == "siteSettings"][0] {
        currency {
          defaultCurrency,
          exchangeRate,
          lastUpdated
        },
        geoLocation {
          ghanaCurrencyCountries,
          defaultCountry
        }
      }`
    )

    if (!settings?.currency) {
      return NextResponse.json(
        {
          defaultCurrency: 'GHS',
          exchangeRate: 0.082,
          lastUpdated: new Date().toISOString(),
          ghanaCurrencyCountries: ['GH'],
          defaultCountry: 'GH',
        },
        { headers: { 'Cache-Control': 'public, s-maxage=300' } }
      )
    }

    return NextResponse.json(
      {
        defaultCurrency: settings.currency.defaultCurrency || 'GHS',
        exchangeRate: settings.currency.exchangeRate || 0.082,
        lastUpdated: settings.currency.lastUpdated,
        ghanaCurrencyCountries: settings.geoLocation?.ghanaCurrencyCountries || ['GH'],
        defaultCountry: settings.geoLocation?.defaultCountry || 'GH',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300' } }
    )
  } catch (error) {
    console.error('Currency fetch error:', error)
    return NextResponse.json(
      {
        defaultCurrency: 'GHS',
        exchangeRate: 0.082,
        lastUpdated: new Date().toISOString(),
        ghanaCurrencyCountries: ['GH'],
        defaultCountry: 'GH',
      },
      { headers: { 'Cache-Control': 'public, s-maxage=300' } }
    )
  }
}

/**
 * POST /api/currency/convert
 * Convert between GHS and USD
 * Body: { amount: number, from: 'GHS' | 'USD', to: 'GHS' | 'USD' }
 */
export async function POST(request: NextRequest) {
  try {
    const { amount, from, to } = await request.json()

    if (!amount || !from || !to) {
      return NextResponse.json(
        { error: 'amount, from, and to are required' },
        { status: 400 }
      )
    }

    if (from === to) {
      return NextResponse.json({
        original: amount,
        converted: amount,
        from,
        to,
        exchangeRate: 1,
      })
    }

    // Fetch current exchange rate from Sanity
    const settings = await serverClient.fetch<any>(
      `*[_type == "siteSettings"][0].currency.exchangeRate`
    )

    const exchangeRate = settings || 0.082

    let converted: number

    if (from === 'GHS' && to === 'USD') {
      converted = convertGHSToUSD(amount, exchangeRate)
    } else if (from === 'USD' && to === 'GHS') {
      converted = convertUSDToGHS(amount, exchangeRate)
    } else {
      return NextResponse.json(
        { error: 'Invalid currency pair' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      original: amount,
      converted,
      from,
      to,
      exchangeRate,
    })
  } catch (error) {
    console.error('Currency conversion error:', error)
    return NextResponse.json(
      { error: 'Conversion failed' },
      { status: 500 }
    )
  }
}
