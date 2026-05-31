import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await fetch('https://ipwho.is/?fields=country_code', {
      method: 'GET',
      cache: 'no-store',
    })

    if (response.ok) {
      const data = (await response.json()) as { country_code?: string }
      if (data.country_code) {
        return NextResponse.json({ countryCode: data.country_code.toUpperCase() })
      }
    }
  } catch {
    // fall through to default
  }

  return NextResponse.json({ countryCode: null })
}
