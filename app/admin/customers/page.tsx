'use client'

import { useState, useEffect } from 'react'
import { Search, Mail, Phone, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminAuth } from '@/lib/useAdminAuth'

interface Customer {
    id: string
    email: string
    phone: string
    firstName: string
    lastName: string
    status: string
    loyaltyPoints: number
    totalOrders: number
    totalSpent: number
    registeredAt: string
}

export default function AdminCustomers() {
    const router = useRouter()
    const { user, isLoading: authLoading, isMounted } = useAdminAuth()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (isMounted && user && !authLoading) {
            fetchCustomers()
        }
    }, [isMounted, user, authLoading])

    const fetchCustomers = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/admin/customers', {
                credentials: 'include',
                cache: 'no-store' as any,
            })
            if (response.ok) {
                const result = await response.json()
                setCustomers(result.data?.customers || [])
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredCustomers = customers.filter((customer) => {
        const matchesSearch =
            customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery)
        return matchesSearch
    })

    return (
        <div className="min-h-screen bg-brand-cream dark:bg-darkbg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/admin/dashboard" className="p-2 hover:bg-neutral-200 dark:hover:bg-gray-800 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-brand-dark dark:text-gray-400" />
                    </Link>
                    <h1 className="text-3xl font-bold text-brand-dark dark:text-white">Customers</h1>
                </div>

                {/* Search Bar */}
                <div className="mb-6 flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-primary/20 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-brand-dark dark:text-white placeholder-neutral-400 dark:placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-brand-cream dark:bg-gray-900 rounded-lg shadow-sm border border-brand-primary/10 dark:border-gray-800 overflow-hidden">
                    {isLoading ? (
                        <div className="px-6 py-8 text-center text-neutral-500 dark:text-gray-400">
                            <p>Loading customers...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="px-6 py-8 text-center text-neutral-500 dark:text-gray-400">
                            <p>No customers found.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-brand-primary/10 dark:divide-gray-800">
                            <thead className="bg-brand-primary/5 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                                        Orders
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                                        Total Spent
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-gray-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-primary/10 dark:divide-gray-800">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-brand-primary/5 dark:hover:bg-gray-800 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-brand-dark dark:text-white">
                                            {customer.firstName} {customer.lastName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-neutral-400" />
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-neutral-400" />
                                                {customer.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-dark dark:text-white font-medium">
                                            {customer.totalOrders}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-dark dark:text-white font-medium">
                                            GH₵{Number(customer.totalSpent).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-gray-300">
                                            {new Date(customer.registeredAt).toLocaleDateString()}
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
