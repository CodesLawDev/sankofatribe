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

        // Fetch orders for calculations
        const orders = await serverClient.fetch(`*[_type == "order"]`)
        
        // Calculate key metrics
        const totalOrders = orders.length
        const pendingOrders = orders.filter((o: any) => o.status === 'pending_payment').length
        const processingOrders = orders.filter((o: any) => o.status === 'processing').length
        const shippedOrders = orders.filter((o: any) => o.status === 'shipped').length
        const completedOrders = orders.filter((o: any) => o.status === 'delivered').length
        const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled').length
        const refundedOrders = orders.filter((o: any) => o.status === 'refunded').length

        // Revenue calculations
        const totalRevenue = orders
            .filter((o: any) => o.status !== 'cancelled' && o.status !== 'refunded')
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

        const paidRevenue = orders
            .filter((o: any) => o.paymentStatus === 'paid')
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

        const unpaidRevenue = orders
            .filter((o: any) => o.paymentStatus === 'unpaid')
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

        // Average order value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

        // Today's stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)

        const todaysOrders = orders.filter((o: any) => {
            const orderDate = new Date(o.orderDate)
            return orderDate >= today && orderDate < tomorrow
        })

        const todaysRevenue = todaysOrders
            .filter((o: any) => o.status !== 'cancelled' && o.status !== 'refunded')
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

        const todaysPaidOrders = todaysOrders.filter((o: any) => o.paymentStatus === 'paid').length
        const todaysUnpaidOrders = todaysOrders.filter((o: any) => o.paymentStatus === 'unpaid').length

        // This week's stats
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        
        const thisWeekRevenue = orders
            .filter((o: any) => {
                const orderDate = new Date(o.orderDate)
                return orderDate >= startOfWeek && o.status !== 'cancelled' && o.status !== 'refunded'
            })
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0)

        // Get revenue by day for chart
        const revenueByDay: { [key: string]: { revenue: number; orders: number } } = {}
        orders.forEach((order: any) => {
            const date = new Date(order.orderDate).toISOString().split('T')[0]
            if (!revenueByDay[date]) {
                revenueByDay[date] = { revenue: 0, orders: 0 }
            }
            if (order.status !== 'cancelled' && order.status !== 'refunded') {
                revenueByDay[date].revenue += order.total || 0
            }
            revenueByDay[date].orders++
        })

        const revenueByDayArray = Object.entries(revenueByDay)
            .map(([date, data]) => ({
                date,
                revenue: data.revenue,
                orders: data.orders,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Top products
        const topProducts: { [key: string]: { name: string; sales: number; revenue: number } } = {}
        orders.forEach((order: any) => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item: any) => {
                    const itemId = item._id || item.name
                    if (!topProducts[itemId]) {
                        topProducts[itemId] = { name: item.name || item.title, sales: 0, revenue: 0 }
                    }
                    topProducts[itemId].sales += item.quantity || 1
                    topProducts[itemId].revenue += (item.price || 0) * (item.quantity || 1)
                })
            }
        })

        const topProductsArray = Object.values(topProducts)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        // Total customers
        const customerEmails = new Set<string>()
        orders.forEach((order: any) => {
            if (order.customer?.email) {
                customerEmails.add(order.customer.email)
            }
        })

        return NextResponse.json(
            {
                success: true,
                totalOrders,
                pendingOrders,
                processingOrders,
                shippedOrders,
                completedOrders,
                cancelledOrders,
                refundedOrders,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                paidRevenue: parseFloat(paidRevenue.toFixed(2)),
                unpaidRevenue: parseFloat(unpaidRevenue.toFixed(2)),
                avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
                todaysRevenue: parseFloat(todaysRevenue.toFixed(2)),
                todaysOrders: todaysOrders.length,
                todaysPaidOrders,
                todaysUnpaidOrders,
                thisWeekRevenue: parseFloat(thisWeekRevenue.toFixed(2)),
                totalCustomers: customerEmails.size,
                revenueByDay: revenueByDayArray,
                topProducts: topProductsArray,
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
        console.error('Stats API error:', error)
        const message = error instanceof Error ? error.message : 'Failed to fetch stats'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
