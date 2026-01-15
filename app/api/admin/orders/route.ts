import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getPrisma } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Get query parameters for filtering
        const status = request.nextUrl.searchParams.get('status')
        const paymentStatus = request.nextUrl.searchParams.get('paymentStatus')
        const limit = parseInt(request.nextUrl.searchParams.get('limit') || '100')
        const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

        const prisma = getPrisma()

        // Build filter object
        const where: any = {}
        if (status) {
            where.status = status.toUpperCase()
        }
        if (paymentStatus) {
            where.paymentStatus = paymentStatus.toLowerCase()
        }

        // Fetch orders with user information
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                    items: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit,
                skip: offset,
            }),
            prisma.order.count({ where }),
        ])

        // Transform orders for frontend
        const transformedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            total: order.total,
            status: order.status,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            user: order.user,
            itemCount: order.items.length,
        }))

        return NextResponse.json(
            {
                success: true,
                data: transformedOrders,
                pagination: {
                    total,
                    limit,
                    offset,
                    pages: Math.ceil(total / limit),
                },
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        )
    } catch (error: any) {
        console.error('Get orders error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch orders' },
            { status: 500 }
        )
    }
}
