import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/lib/sanity-server'
import { getAdminSession } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const session = getAdminSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get query parameters for filtering
        const status = request.nextUrl.searchParams.get('status')
        const paymentStatus = request.nextUrl.searchParams.get('paymentStatus')
        const dateFrom = request.nextUrl.searchParams.get('dateFrom')
        const dateTo = request.nextUrl.searchParams.get('dateTo')
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')
        const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

        // Build GROQ query with filters
        let query = `*[_type == "order"`

        if (status) {
            query += ` && status == "${status}"`
        }

        if (paymentStatus) {
            query += ` && paymentStatus == "${paymentStatus}"`
        }

        if (dateFrom || dateTo) {
            if (dateFrom && dateTo) {
                query += ` && orderDate >= "${dateFrom}" && orderDate <= "${dateTo}"`
            } else if (dateFrom) {
                query += ` && orderDate >= "${dateFrom}"`
            } else if (dateTo) {
                query += ` && orderDate <= "${dateTo}"`
            }
        }

        query += `] | order(orderDate desc) [${offset}...${offset + limit}] {
            _id,
            orderId,
            orderDate,
            status,
            paymentStatus,
            paymentReference,
            customer,
            shippingAddress,
            items,
            subtotal,
            shippingCost,
            tax,
            total,
            metadata
        }`

        // Get total count for pagination
        let countQuery = `count(*[_type == "order"`
        if (status) countQuery += ` && status == "${status}"`
        if (paymentStatus) countQuery += ` && paymentStatus == "${paymentStatus}"`
        if (dateFrom || dateTo) {
            if (dateFrom && dateTo) {
                countQuery += ` && orderDate >= "${dateFrom}" && orderDate <= "${dateTo}"`
            } else if (dateFrom) {
                countQuery += ` && orderDate >= "${dateFrom}"`
            } else if (dateTo) {
                countQuery += ` && orderDate <= "${dateTo}"`
            }
        }
        countQuery += `])`

        const [orders, total] = await Promise.all([
            serverClient.fetch(query),
            serverClient.fetch(countQuery)
        ])

        return NextResponse.json(
            {
                success: true,
                orders,
                pagination: {
                    total,
                    limit,
                    offset,
                    pages: Math.ceil(total / limit)
                }
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        )
    } catch (error) {
        console.error('Orders API error:', error)
        const message = error instanceof Error ? error.message : 'Failed to fetch orders'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
