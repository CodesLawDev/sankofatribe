import { NextRequest, NextResponse } from 'next/server'
import { serverClient, assertSanityToken } from '@/lib/sanity-server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
    _request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        const order = await serverClient.getDocument(params.orderId)

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        return NextResponse.json(
            { order },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        )
    } catch (error) {
        console.error('Order API error:', error)
        const message = error instanceof Error ? error.message : 'Failed to fetch order'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { orderId: string } }
) {
    try {
        assertSanityToken()

        const updates = await request.json()
        const { orderId } = params

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
