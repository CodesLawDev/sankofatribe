'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import AdminPageHeader from '@/components/admin/admin-page-header'
import { AdminFilterBar, AdminSearchInput } from '@/components/admin/admin-button'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import { AdminDataTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from '@/components/admin/admin-section'
import { AdminTableSkeleton } from '@/components/admin/admin-skeleton'

interface Customer {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
  totalOrders: number
  totalSpent: number
  registeredAt: string
}

export default function AdminCustomers() {
  const { user, isLoading: authLoading, isMounted } = useAdminAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isMounted && user && !authLoading) fetchCustomers()
  }, [isMounted, user, authLoading])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/customers', { credentials: 'include', cache: 'no-store' })
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

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.email.toLowerCase().includes(q) ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.phone.includes(searchQuery)
    )
  })

  return (
    <>
      <AdminPageHeader title="Customers" description="Registered shoppers and their purchase history." />

      <AdminFilterBar>
        <AdminSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search by name, email, or phone..." />
      </AdminFilterBar>

      <AdminDataTable>
        {isLoading ? (
          <AdminTableSkeleton rows={8} cols={6} />
        ) : filteredCustomers.length === 0 ? (
          <AdminEmptyState title="No customers found" description="Customer accounts will appear after registration." />
        ) : (
          <table className="min-w-full">
            <AdminTableHead>
              <AdminTh>Name</AdminTh>
              <AdminTh>Email</AdminTh>
              <AdminTh>Phone</AdminTh>
              <AdminTh>Orders</AdminTh>
              <AdminTh>Total spent</AdminTh>
              <AdminTh>Joined</AdminTh>
            </AdminTableHead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <AdminTr key={customer.id}>
                  <AdminTd className="font-medium">{customer.firstName} {customer.lastName}</AdminTd>
                  <AdminTd>
                    <span className="flex items-center gap-2 text-[var(--admin-text-muted)]">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {customer.email}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <span className="flex items-center gap-2 text-[var(--admin-text-muted)]">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {customer.phone || '—'}
                    </span>
                  </AdminTd>
                  <AdminTd><span className="font-admin-mono">{customer.totalOrders}</span></AdminTd>
                  <AdminTd><span className="font-admin-mono">GH₵{Number(customer.totalSpent).toFixed(2)}</span></AdminTd>
                  <AdminTd className="text-[var(--admin-text-muted)]">{new Date(customer.registeredAt).toLocaleDateString()}</AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </table>
        )}
      </AdminDataTable>
    </>
  )
}
