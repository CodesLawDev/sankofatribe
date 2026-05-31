'use client'

import { useEffect, useState } from 'react'
import { Send, Loader, CheckCircle, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminSection, { AdminField } from '@/components/admin/admin-section'
import AdminStat from '@/components/admin/admin-stat'
import AdminButton from '@/components/admin/admin-button'
import AdminAlert from '@/components/admin/admin-alert'
import { adminInputClass } from '@/lib/admin/utils'
import { AdminPageSkeleton } from '@/components/admin/admin-skeleton'

interface Customer {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
}

interface SendResult {
  success: boolean
  sent: number
  failed: number
  message: string
  creditsUsed?: number
  remainingCredits?: number
}

export default function SMSPage() {
  const { user, isLoading: authLoading, isMounted } = useAdminAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [recipientType, setRecipientType] = useState<'selected' | 'all'>('selected')
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
    return c.email.toLowerCase().includes(q) || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.phone.includes(q)
  })

  const toggleCustomer = (id: string) => {
    const next = new Set(selectedCustomers)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedCustomers(next)
  }

  const selectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) setSelectedCustomers(new Set())
    else setSelectedCustomers(new Set(filteredCustomers.map((c) => c.id)))
  }

  const getRecipientPhones = () => {
    const list = recipientType === 'all' ? filteredCustomers : filteredCustomers.filter((c) => selectedCustomers.has(c.id))
    return list.filter((c) => c.phone).map((c) => c.phone)
  }

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault()
    const phones = getRecipientPhones()
    if (!message.trim() || phones.length === 0) {
      setResult({ success: false, sent: 0, failed: 0, message: 'Message and at least one recipient required.' })
      return
    }
    try {
      setIsSending(true)
      const response = await fetch('/api/admin/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phones, message: message.trim() }),
      })
      const data = await response.json()
      setResult(data)
      if (data.success) {
        setMessage('')
        setSelectedCustomers(new Set())
        setTimeout(() => setResult(null), 5000)
      }
    } catch {
      setResult({ success: false, sent: 0, failed: 0, message: 'Failed to send SMS.' })
    } finally {
      setIsSending(false)
    }
  }

  const phoneCount = getRecipientPhones().length
  const estimatedSMS = Math.ceil(message.length / 160) || 0

  if (authLoading || !isMounted) return <AdminPageSkeleton />

  return (
    <div className="space-y-8">
      <AdminPageHeader title="SMS Marketing" description="Send bulk messages to customers with phone numbers on file." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminSection title="Compose message">
            <form onSubmit={handleSendSMS} className="space-y-5">
              <AdminField label="Recipients">
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input type="radio" checked={recipientType === 'selected'} onChange={() => setRecipientType('selected')} className="accent-[var(--admin-accent)]" />
                    Selected customers ({selectedCustomers.size})
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input type="radio" checked={recipientType === 'all'} onChange={() => setRecipientType('all')} className="accent-[var(--admin-accent)]" />
                    All with phone ({filteredCustomers.filter((c) => c.phone).length})
                  </label>
                </div>
              </AdminField>

              <AdminField label="Message" hint={`${message.length}/480 characters · ~${estimatedSMS || 1} SMS segment${estimatedSMS === 1 ? '' : 's'}`}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={480}
                  placeholder="Write your message..."
                  className={adminInputClass}
                />
              </AdminField>

              {result && (
                <AdminAlert variant={result.success ? 'success' : 'error'}>
                  <span className="flex items-start gap-2">
                    {result.success ? <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                    <span>
                      {result.message}
                      {result.success && (
                        <span className="mt-1 block text-xs opacity-80">Sent: {result.sent}{result.failed > 0 ? ` · Failed: ${result.failed}` : ''}</span>
                      )}
                    </span>
                  </span>
                </AdminAlert>
              )}

              <AdminButton type="submit" disabled={isSending || !message.trim() || phoneCount === 0}>
                {isSending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send SMS
              </AdminButton>
            </form>
          </AdminSection>
        </div>

        <div className="space-y-6">
          <div className="grid gap-3">
            <AdminStat label="Recipients" value={recipientType === 'selected' ? selectedCustomers.size : phoneCount} />
            <AdminStat label="SMS segments" value={estimatedSMS || '—'} hint="160 chars per segment" />
          </div>

          <AdminSection title="Select customers">
            {isLoading ? (
              <p className="text-sm text-[var(--admin-text-muted)]">Loading...</p>
            ) : (
              <>
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${adminInputClass} mb-3`}
                />
                <button type="button" onClick={selectAll} className="admin-press mb-3 text-xs font-medium text-[var(--admin-accent)]">
                  {selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0 ? 'Deselect all' : 'Select all'}
                </button>
                <div className="max-h-80 space-y-1 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <label key={customer.id} className="admin-press flex cursor-pointer items-start gap-3 rounded-lg p-2">
                      <input type="checkbox" checked={selectedCustomers.has(customer.id)} onChange={() => toggleCustomer(customer.id)} className="mt-1 accent-[var(--admin-accent)]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{customer.firstName} {customer.lastName}</p>
                        <p className="truncate text-xs text-[var(--admin-text-muted)]">{customer.phone || 'No phone'}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </AdminSection>
        </div>
      </div>
    </div>
  )
}
