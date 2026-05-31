import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

export const dynamic = 'force-dynamic'

const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{adminPhone, senderId, currency, geoLocation}`
const PUBLIC_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{senderId, currency, geoLocation}`

// Settings endpoint. Requires internal secret or admin auth.
// Without auth, only non-sensitive fields are returned.
export async function GET(req: NextRequest) {
    try {
        const internalSecret = process.env.INTERNAL_API_SECRET
        const providedSecret = req.headers.get('x-internal-secret')
        const isInternal = internalSecret && providedSecret === internalSecret

        if (!isInternal) {
            // Check for admin JWT
            const { verifyToken } = await import('@/lib/auth-utils')
            const authToken = req.cookies.get('auth-token')?.value
            const user = authToken ? await verifyToken(authToken) : null
            const isAdmin = user && ['ADMIN', 'SUPERADMIN'].includes(user.role)

            if (!isAdmin) {
                // Public: strip sensitive fields
                const settings = await serverClient.fetch<{
                    senderId?: string
                    currency?: { defaultCurrency?: 'GHS' | 'USD'; exchangeRate?: number; lastUpdated?: string }
                    geoLocation?: { ghanaCurrencyCountries?: string[]; defaultCountry?: string }
                }>(PUBLIC_SETTINGS_QUERY)
                return NextResponse.json({
                    data: {
                        senderId: settings?.senderId || '',
                        currency: settings?.currency || null,
                        geoLocation: settings?.geoLocation || null,
                    },
                })
            }
        }

        // Internal or admin: return full settings
        const settings = await serverClient.fetch<{
            adminPhone?: string
            senderId?: string
            currency?: { defaultCurrency?: 'GHS' | 'USD'; exchangeRate?: number; lastUpdated?: string }
            geoLocation?: { ghanaCurrencyCountries?: string[]; defaultCountry?: string }
        }>(SETTINGS_QUERY)
        const adminPhone = settings?.adminPhone || ''
        const senderId = settings?.senderId || ''

        return NextResponse.json({
            data: {
                adminPhone,
                senderId,
                currency: settings?.currency || null,
                geoLocation: settings?.geoLocation || null,
            },
        })
    } catch (error) {
        console.error('settings endpoint error:', error)
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
    }
}
