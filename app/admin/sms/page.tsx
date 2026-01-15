'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle,
  Users,
  MessageSquare,
  Loader,
} from 'lucide-react'
import { getAdminSession } from '@/lib/adminAuth'
import { hasPermission } from '@/lib/adminTypes'

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
  messageId?: string
  creditsUsed?: number
  remainingCredits?: number
  error?: string
}

export default function SMSPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [recipientType, setRecipientType] = useState<'selected' | 'all'>('selected')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch customers
  useEffect(() => {
    const session = getAdminSession()
    if (!session || !hasPermission(session.user, 'send_sms')) {
      router.push('/admin')
      return
    }

    fetchCustomers()
  }, [router])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/customers', {
        credentials: 'include',
        cache: 'no-store' as any,
      })
      if (response.ok) {
        const result = await response.json()
        const customerList = Array.isArray(result.data?.customers) ? result.data.customers : (Array.isArray(result) ? result : [])
        setCustomers(customerList)
      } else {
        setCustomers([])
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate filtered customers based on search query
  const filteredCustomers = Array.isArray(customers) ? customers.filter(c => {
    const query = searchQuery.toLowerCase()
    return (
      c.email.toLowerCase().includes(query) ||
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.phone.includes(query)
    )
  }) : []

  const toggleCustomer = (customerId: string) => {
    const newSelected = new Set(selectedCustomers)
    if (newSelected.has(customerId)) {
      newSelected.delete(customerId)
    } else {
      newSelected.add(customerId)
    }
    setSelectedCustomers(newSelected)
  }

  const selectAll = () => {
    if (selectedCustomers.size === filteredCustomers.length) {
      setSelectedCustomers(new Set())
    } else {
      setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)))
    }
  }

  const getRecipientPhones = () => {
    let recipients: Customer[] = []
    if (recipientType === 'all') {
      recipients = filteredCustomers
    } else {
      recipients = filteredCustomers.filter(c => selectedCustomers.has(c.id))
    }
    return recipients.filter(c => c.phone).map(c => c.phone)
  }

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      setResult({
        success: false,
        sent: 0,
        failed: 0,
        message: 'Please enter a message',
        error: 'Message is required',
      })
      return
    }

    const phones = getRecipientPhones()
    if (phones.length === 0) {
      setResult({
        success: false,
        sent: 0,
        failed: 0,
        message: 'No customers with phone numbers selected',
        error: 'Please select at least one customer',
      })
      return
    }

    try {
      setIsSending(true)
      const response = await fetch('/api/admin/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phones,
          message: message.trim(),
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setMessage('')
        setSelectedCustomers(new Set())
        setTimeout(() => setResult(null), 5000)
      }
    } catch (error: any) {
      setResult({
        success: false,
        sent: 0,
        failed: 0,
        message: 'Failed to send SMS',
        error: error.message,
      })
    } finally {
      setIsSending(false)
    }
  }

  const selectedCount = selectedCustomers.size
  const phoneCount = getRecipientPhones().length
  const messageLength = message.length
  const estimatedSMS = Math.ceil(messageLength / 160)

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-darkbg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 hover:bg-brand-primary/5 dark:hover:bg-gray-800 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-brand-dark dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-brand-dark dark:text-white">Send SMS</h1>
            <p className="text-neutral-600 dark:text-gray-400 text-sm mt-1">
              Send bulk SMS messages to your customers
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Message Form */}
            <form onSubmit={handleSendSMS} className="bg-brand-cream dark:bg-gray-900 rounded-lg shadow-sm border border-brand-primary/10 dark:border-gray-800 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-brand-dark dark:text-white mb-2">
                  Send To
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="recipient-type"
                      value="selected"
                      checked={recipientType === 'selected'}
                      onChange={(e) => setRecipientType(e.target.value as 'selected' | 'all')}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                    />
                    <span className="text-sm text-brand-dark dark:text-gray-300">
                      Selected Customers ({selectedCount})
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="recipient-type"
                      value="all"
                      checked={recipientType === 'all'}
                      onChange={(e) => setRecipientType(e.target.value as 'selected' | 'all')}
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                    />
                    <span className="text-sm text-brand-dark dark:text-gray-300">
                      All Customers with Phone ({filteredCustomers.filter(c => c.phone).length})
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-brand-dark dark:text-white mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={5}
                  maxLength={480}
                  className="w-full px-4 py-2 border border-brand-primary/20 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-brand-dark dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-neutral-600 dark:text-gray-400">
                    {messageLength}/480 characters
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-gray-400">
                    ~{estimatedSMS} SMS {estimatedSMS === 1 ? 'message' : 'messages'}
                  </p>
                </div>
              </div>

              {result && (
                <div className={`p-4 rounded-lg flex gap-3 ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${result.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                      {result.message}
                    </p>
                    {result.success && (
                      <div className={`text-sm mt-1 ${result.success ? 'text-green-700 dark:text-green-200' : 'text-red-700 dark:text-red-200'}`}>
                        <p>✓ Sent: {result.sent}</p>
                        {result.failed > 0 && <p>✗ Failed: {result.failed}</p>}
                        {result.messageId && <p>Message ID: {result.messageId}</p>}
                        {result.creditsUsed && <p>Credits Used: {result.creditsUsed}</p>}
                        {result.remainingCredits !== undefined && <p>Remaining Credits: {result.remainingCredits}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSending || !message.trim() || (recipientType === 'selected' && selectedCount === 0) || (recipientType === 'all' && phoneCount === 0)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary/90 disabled:bg-gray-400 text-brand-cream font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isSending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send SMS
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Summary
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recipients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recipientType === 'selected' ? selectedCount : phoneCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">SMS Count</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{estimatedSMS}</p>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    💡 Tip: Messages over 160 characters will count as multiple SMS
                  </p>
                </div>
              </div>
            </div>

            {/* Customer List Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Customers
              </h3>

              {isLoading ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Loading customers...</p>
              ) : (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={selectAll}
                    className="mb-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                        No customers found
                      </p>
                    ) : (
                      filteredCustomers.map(customer => (
                        <label
                          key={customer.id}
                          className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCustomers.has(customer.id)}
                            onChange={() => toggleCustomer(customer.id)}
                            className="w-4 h-4 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {customer.firstName} {customer.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {customer.email}
                            </p>
                            {customer.phone ? (
                              <p className="text-xs text-gray-600 dark:text-gray-300">{customer.phone}</p>
                            ) : (
                              <p className="text-xs text-red-500 dark:text-red-400">No phone number</p>
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
