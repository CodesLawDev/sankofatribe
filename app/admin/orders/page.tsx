'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, Edit, Trash2, Search, Filter, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAdminSession } from '@/lib/adminAuth'
import { hasPermission } from '@/lib/adminTypes'

interface Order {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
    user?: {
        firstName: string
        lastName: string
        email: string
    }
}

export default function AdminOrders() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        const session = getAdminSession()
        if (!session) {
            router.push('/admin/login')
            return
        }

        if (!hasPermission(session.user, 'view_orders')) {
            router.push('/admin')
            return
        }

        fetchOrders()
    }, [router])

    const fetchOrders = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/orders', {
                credentials: 'include',
                cache: 'no-store' as any,
            })
            if (response.ok) {
                const result = await response.json()
                setOrders(result.data || [])
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredOrders = orders
        .filter((order) => {
            const matchesSearch =
                order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesStatus = filterStatus === 'all' || order.status.toUpperCase() === filterStatus.toUpperCase()
            return matchesSearch && matchesStatus
        })

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'PROCESSING':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'SHIPPED':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            case 'DELIVERED':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-darkbg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
                </div>

                {/* Filters */}
                <div className="mb-6 flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-64 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {isLoading ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            <p>Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            <p>No orders found.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {order.orderNumber}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            GH₵{order.total.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm flex gap-2">
                                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
