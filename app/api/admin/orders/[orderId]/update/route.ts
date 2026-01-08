import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken } from '@/lib/sanity-server'

export async function POST(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        assertSanityToken()

        const updates = await request.json()
        const { orderId } = params

        const existing = await serverClient.getDocument(orderId)

        if (!existing) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const updated = await serverClient
            .patch(orderId)
            .set(updates)
            .commit()

        return NextResponse.json({ success: true, order: updated })
    } catch (error) {
        console.error('Order update error:', error)
        const message = error instanceof Error ? error.message : 'Failed to update order'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
