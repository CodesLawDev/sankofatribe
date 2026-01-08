import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'

const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{adminPhone, senderId}`

// Settings endpoint used by payment verification flow.
export async function GET(_req: NextRequest) {
    try {
        const settings = await serverClient.fetch<{ adminPhone?: string; senderId?: string }>(SETTINGS_QUERY)
        const adminPhone = settings?.adminPhone || ''
        const senderId = settings?.senderId || ''

        return NextResponse.json({ data: { adminPhone, senderId } })
    } catch (error) {
        console.error('settings endpoint error:', error)
        return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
    }
}
