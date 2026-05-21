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
  activePaymentGateway?: 'hubtel' | 'paystack' | 'both'
  adminPhone: string
  whatsappNumber?: string
  senderId: string
  currency: {
    defaultCurrency: 'GHS' | 'USD'
    exchangeRate: number
    lastUpdated?: string
  }
  paymentGateways?: {
    hubtelEnabled?: boolean
    paystackEnabled?: boolean
    defaultGateway?: 'hubtel' | 'paystack'
  }
  geoLocation?: {
    ghanaCurrencyCountries?: string[]
    defaultCountry?: string
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
      <div className="min-h-screen bg-brand-cream dark:bg-darkbg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-dark dark:border-white"></div>
          <p className="mt-4 text-neutral-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const session = getAdminSession()

  return (
    <div className="min-h-screen bg-brand-cream dark:bg-darkbg">
      {/* Header */}
      <div className="bg-brand-cream dark:bg-gray-900 border-b border-brand-primary/10 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-gray-400 hover:text-brand-dark dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm text-neutral-600 dark:text-gray-400">
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
            <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-medium uppercase tracking-wider mb-6 text-brand-dark dark:text-white">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={settings.description || ''}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Active Payment Gateway</label>
                  <select
                    value={settings.activePaymentGateway || 'both'}
                    onChange={(e) => setSettings({ ...settings, activePaymentGateway: e.target.value as any })}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  >
                    <option value="hubtel">Hubtel Only</option>
                    <option value="paystack">Paystack Only</option>
                    <option value="both">Both (User Choice)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Controls which payment options are shown to customers at checkout.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Admin Phone</label>
                  <input
                    type="tel"
                    value={settings.adminPhone}
                    onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
                    placeholder="+233XXXXXXXXX"
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for SMS alerts</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={settings.whatsappNumber || ''}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="233541234567"
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Public WhatsApp number for customer support chat button</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SMS Sender ID</label>
                  <input
                    type="text"
                    value={settings.senderId}
                    onChange={(e) => setSettings({ ...settings, senderId: e.target.value })}
                    placeholder="SANKOFA"
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                    maxLength={11}
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 11 characters</p>
                </div>
              </div>
            </div>

            {/* Currency & Exchange Rate */}
            <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-medium uppercase tracking-wider mb-6 text-brand-dark dark:text-white">Currency & Exchange Rate</h2>
              
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
                      className="w-32 px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
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

            {/* Payment Gateways */}
            <PaymentGatewaysCard settings={settings} setSettings={setSettings} />

            {/* Geo Location Settings */}
            <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6 shadow-sm">
              <h2 className="text-lg font-medium uppercase tracking-wider mb-6 text-brand-dark dark:text-white">Geo Location Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Country Code</label>
                  <input
                    type="text"
                    value={settings.geoLocation?.defaultCountry || 'GH'}
                    onChange={(e) => setSettings({
                      ...settings,
                      geoLocation: {
                        ...settings.geoLocation,
                        defaultCountry: e.target.value.toUpperCase(),
                      },
                    })}
                    placeholder="GH"
                    maxLength={2}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">ISO country code (e.g., GH for Ghana)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Countries Using GHS</label>
                  <textarea
                    value={(settings.geoLocation?.ghanaCurrencyCountries || []).join(', ')}
                    onChange={(e) => setSettings({
                      ...settings,
                      geoLocation: {
                        ...settings.geoLocation,
                        ghanaCurrencyCountries: e.target.value.split(',').map(c => c.trim().toUpperCase()).filter(c => c),
                      },
                    })}
                    rows={3}
                    placeholder="GH, BJ, TG"
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded bg-white dark:bg-gray-800 text-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated ISO country codes</p>
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

interface PaymentGatewaysCardProps {
  settings: SiteSettings
  setSettings: (s: SiteSettings) => void
}

function PaymentGatewaysCard({ settings, setSettings }: PaymentGatewaysCardProps) {
  const gateways = settings.paymentGateways || {}
  const hubtelEnabled = gateways.hubtelEnabled ?? true
  const paystackEnabled = gateways.paystackEnabled ?? false
  const defaultGateway = gateways.defaultGateway || 'hubtel'

  const update = (patch: Partial<NonNullable<SiteSettings['paymentGateways']>>) => {
    setSettings({
      ...settings,
      paymentGateways: {
        hubtelEnabled,
        paystackEnabled,
        defaultGateway,
        ...patch,
      },
    })
  }

  const toggleHubtel = () => update({ hubtelEnabled: !hubtelEnabled })
  const togglePaystack = () => update({ paystackEnabled: !paystackEnabled })

  const noneEnabled = !hubtelEnabled && !paystackEnabled
  const defaultDisabled =
    (defaultGateway === 'hubtel' && !hubtelEnabled) ||
    (defaultGateway === 'paystack' && !paystackEnabled)

  return (
    <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6 shadow-sm">
      <h2 className="text-lg font-medium uppercase tracking-wider mb-6 text-brand-dark dark:text-white">
        Payment Gateways
      </h2>

      <div className="space-y-4">
        <GatewayToggle
          name="Hubtel"
          subtitle="Mobile Money (MTN MoMo, Telecel Cash, AirtelTigo Money)"
          enabled={hubtelEnabled}
          onToggle={toggleHubtel}
        />

        <GatewayToggle
          name="Paystack"
          subtitle="Card, Mobile Money, Bank Transfer"
          enabled={paystackEnabled}
          onToggle={togglePaystack}
        />

        <div className="pt-2 border-t border-brand-primary/10 dark:border-gray-800">
          <label className="block text-sm font-medium mb-2 mt-3">Default Gateway</label>
          <p className="text-xs text-gray-500 mb-3">Used when both gateways are enabled</p>
          <div className="flex gap-3">
            <label className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer ${defaultGateway === 'hubtel' ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-300 dark:border-gray-700'} ${!hubtelEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                name="defaultGateway"
                checked={defaultGateway === 'hubtel'}
                disabled={!hubtelEnabled}
                onChange={() => update({ defaultGateway: 'hubtel' })}
              />
              <span className="text-sm">Hubtel</span>
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 border rounded cursor-pointer ${defaultGateway === 'paystack' ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-300 dark:border-gray-700'} ${!paystackEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="radio"
                name="defaultGateway"
                checked={defaultGateway === 'paystack'}
                disabled={!paystackEnabled}
                onChange={() => update({ defaultGateway: 'paystack' })}
              />
              <span className="text-sm">Paystack</span>
            </label>
          </div>
        </div>

        {noneEnabled && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>At least one payment gateway must be enabled — saving will fail otherwise.</span>
          </div>
        )}

        {defaultDisabled && !noneEnabled && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Default gateway &ldquo;{defaultGateway}&rdquo; is disabled. Pick a different default before saving — the app will not fall back to the other gateway.</span>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-700">
          <p className="font-medium mb-1">Note</p>
          <p>The default gateway is the only one used for new payments. No fallback — if the default is disabled or its API keys aren&apos;t set, checkout will fail until you fix it. Verification of in-flight payments is unaffected.</p>
        </div>
      </div>
    </div>
  )
}

function GatewayToggle({
  name,
  subtitle,
  enabled,
  onToggle,
}: {
  name: string
  subtitle: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-brand-primary/10 dark:border-gray-800 rounded">
      <div>
        <p className="text-sm font-medium text-brand-dark dark:text-white">{name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${name}`}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  )
}
