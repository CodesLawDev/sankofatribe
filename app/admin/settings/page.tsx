'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAdminSession, clearAdminSession } from '@/lib/adminAuth'
import { hasPermission } from '@/lib/adminTypes'

interface SiteSettings {
  _id: string
  siteName: string
  description: string
  adminPhone: string
  senderId: string
  currency: {
    defaultCurrency: 'GHS' | 'USD'
    exchangeRate: number
    lastUpdated?: string
  }
  geoLocation?: {
    ghanaCurrencyCountries: string[]
    defaultCountry: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [ghsPerUsd, setGhsPerUsd] = useState<number>(12.5)

  useEffect(() => {
    const session = getAdminSession()
    if (!session) {
      router.push('/admin/login')
      return
    }

    // Check permissions
    if (!hasPermission(session.user, 'view_settings')) {
      router.push('/admin')
      return
    }

    fetchSettings()
  }, [router])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to load settings')
      const data = await response.json()
      setSettings(data)
      // Initialize GHS per USD input from stored USD per GHS
      const rate = data?.currency?.exchangeRate
      if (typeof rate === 'number' && rate > 0) {
        setGhsPerUsd(parseFloat((1 / rate).toFixed(3)))
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load settings' })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    clearAdminSession()
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const session = getAdminSession()

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Header */}
      <div className="bg-brand-cream border-b border-brand-primary/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-brand-dark">
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Link>
            <h1 className="text-2xl font-light tracking-wider uppercase">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm text-gray-600">
                {session.user.firstName} {session.user.lastName}
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </p>
          </div>
        )}

        {settings && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-brand-cream rounded-lg border border-brand-primary/10 p-6 shadow-sm">
              <h2 className="text-lg font-medium uppercase tracking-wider mb-6 text-brand-dark">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={settings.description || ''}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Admin Phone</label>
                  <input
                    type="tel"
                    value={settings.adminPhone}
                    onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
                    placeholder="+233XXXXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for SMS alerts</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SMS Sender ID</label>
                  <input
                    type="text"
                    value={settings.senderId}
                    onChange={(e) => setSettings({ ...settings, senderId: e.target.value })}
                    placeholder="SANKOFA"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 11 characters</p>
                </div>
              </div>
            </div>

            {/* Currency & Exchange Rate */}
            <div className="bg-brand-cream rounded-lg border border-brand-primary/10 p-6 shadow-sm">
              <h2 className="text-lg font-medium uppercase tracking-wider mb-6 text-brand-dark">Currency & Exchange Rate</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Exchange Rate (USD to GHS)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">1 USD =</span>
                    <input
                      type="number"
                      step="0.001"
                      value={ghsPerUsd}
                      onChange={(e) => {
                        const inputVal = parseFloat(e.target.value) || 0
                        setGhsPerUsd(inputVal)
                        const usdPerGhs = inputVal > 0 ? (1 / inputVal) : 0
                        setSettings({
                          ...settings,
                          currency: {
                            ...settings.currency,
                            exchangeRate: parseFloat(usdPerGhs.toFixed(6)),
                          },
                        })
                      }}
                      className="w-32 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                    <span className="text-sm text-gray-600">GHS</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Stored: 1 GHS = {(settings.currency.exchangeRate || 0).toFixed(6)} USD</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-700">
                  <p className="font-medium mb-2">Currency System:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Users in Ghana see GHS (₵)</li>
                    <li>International users see USD ($)</li>
                    <li>Conversion based on exchange rate above</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-brand-primary text-brand-cream hover:bg-brand-primary/90"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => fetchSettings()}
                disabled={isSaving}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
