'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'
import { hasPermission, type AdminUser } from '@/lib/adminTypes'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminSection, { AdminField } from '@/components/admin/admin-section'
import AdminButton from '@/components/admin/admin-button'
import AdminAlert from '@/components/admin/admin-alert'
import { adminInputClass } from '@/lib/admin/utils'
import { AdminPageSkeleton } from '@/components/admin/admin-skeleton'

interface SiteSettings {
  _id: string
  siteName: string
  description: string
  adminPhone: string
  whatsappNumber?: string
  senderId: string
  currency: {
    defaultCurrency: 'GHS' | 'USD'
    exchangeRate: number
    lastUpdated?: string
  }
  paymentGateways?: {
    productCheckout?: {
      hubtelEnabled?: boolean
      paystackEnabled?: boolean
    }
    ticketing?: {
      hubtelEnabled?: boolean
      paystackEnabled?: boolean
    }
  }
  geoLocation?: {
    ghanaCurrencyCountries?: string[]
    defaultCountry?: string
  }
}

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [ghsPerUsd, setGhsPerUsd] = useState<number>(12.5)

  useEffect(() => {
    const init = async () => {
      try {
        const meResponse = await fetch('/api/auth/me', { credentials: 'include' })
        if (!meResponse.ok) {
          router.push('/admin/login')
          return
        }
        const { user: meUser } = await meResponse.json()
        if (meUser.role !== 'ADMIN' && meUser.role !== 'SUPERADMIN') {
          router.push('/admin/login')
          return
        }

        const adminUser: AdminUser = {
          _id: meUser.id,
          email: meUser.email,
          firstName: meUser.firstName ?? '',
          lastName: meUser.lastName ?? '',
          role: meUser.role,
          permissions: meUser.permissions ?? [],
          isActive: meUser.status === 'ACTIVE',
        }

        if (!hasPermission(adminUser, 'view_settings')) {
          router.push('/admin')
          return
        }

        setUser(adminUser)
        await fetchSettings()
      } catch (err) {
        console.error('Settings init failed:', err)
        router.push('/admin/login')
      }
    }

    init()
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

  if (isLoading) {
    return <AdminPageSkeleton />
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Settings" description="Site configuration, payments, and regional preferences." />

      {message && (
        <AdminAlert variant={message.type === 'success' ? 'success' : 'error'}>
          <span className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </span>
        </AdminAlert>
      )}

      {settings && (
        <div className="space-y-6">
          <AdminSection title="General">
            <div className="space-y-4">
              <AdminField label="Site name">
                <input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className={adminInputClass} />
              </AdminField>
              <AdminField label="Description">
                <textarea value={settings.description || ''} onChange={(e) => setSettings({ ...settings, description: e.target.value })} rows={3} className={adminInputClass} />
              </AdminField>
              <AdminField label="Admin phone" hint="Used for SMS alerts">
                <input type="tel" value={settings.adminPhone} onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })} placeholder="+233XXXXXXXXX" className={adminInputClass} />
              </AdminField>
              <AdminField label="WhatsApp number" hint="Public support number for the chat button">
                <input type="tel" value={settings.whatsappNumber || ''} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="233541234567" className={adminInputClass} />
              </AdminField>
              <AdminField label="SMS sender ID" hint="Max 11 characters">
                <input type="text" value={settings.senderId} onChange={(e) => setSettings({ ...settings, senderId: e.target.value })} placeholder="SANKOFA" maxLength={11} className={adminInputClass} />
              </AdminField>
            </div>
          </AdminSection>

          <AdminSection title="Currency and exchange rate">
            <div className="space-y-4">
              <AdminField label="Exchange rate (USD to GHS)" hint={`Stored: 1 GHS = ${(settings.currency.exchangeRate || 0).toFixed(6)} USD`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--admin-text-muted)]">1 USD =</span>
                  <input
                    type="number"
                    step="0.001"
                    value={ghsPerUsd}
                    onChange={(e) => {
                      const inputVal = parseFloat(e.target.value) || 0
                      setGhsPerUsd(inputVal)
                      const usdPerGhs = inputVal > 0 ? 1 / inputVal : 0
                      setSettings({
                        ...settings,
                        currency: { ...settings.currency, exchangeRate: parseFloat(usdPerGhs.toFixed(6)) },
                      })
                    }}
                    className={`${adminInputClass} w-32`}
                  />
                  <span className="text-sm text-[var(--admin-text-muted)]">GHS</span>
                </div>
              </AdminField>
              <p className="text-xs text-[var(--admin-text-muted)]">Ghana visitors see GHS. International visitors see USD based on this rate.</p>
            </div>
          </AdminSection>

            {/* Payment Gateways: per-surface */}
            <PaymentGatewaysCard
              title="Product Checkout Gateways"
              surface="productCheckout"
              settings={settings}
              setSettings={setSettings}
            />

            <PaymentGatewaysCard
              title="Ticketing Gateways"
              surface="ticketing"
              settings={settings}
              setSettings={setSettings}
            />

          <AdminSection title="Geo location">
            <div className="space-y-4">
              <AdminField label="Default country code" hint="ISO code, e.g. GH">
                <input
                  type="text"
                  value={settings.geoLocation?.defaultCountry || 'GH'}
                  onChange={(e) => setSettings({ ...settings, geoLocation: { ...settings.geoLocation, defaultCountry: e.target.value.toUpperCase() } })}
                  placeholder="GH"
                  maxLength={2}
                  className={adminInputClass}
                />
              </AdminField>
              <AdminField label="Countries using GHS" hint="Comma-separated ISO codes">
                <textarea
                  value={(settings.geoLocation?.ghanaCurrencyCountries || []).join(', ')}
                  onChange={(e) => setSettings({
                    ...settings,
                    geoLocation: {
                      ...settings.geoLocation,
                      ghanaCurrencyCountries: e.target.value.split(',').map((c) => c.trim().toUpperCase()).filter(Boolean),
                    },
                  })}
                  rows={3}
                  placeholder="GH, BJ, TG"
                  className={adminInputClass}
                />
              </AdminField>
            </div>
          </AdminSection>

          <div className="flex gap-3">
            <AdminButton onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save changes'}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => fetchSettings()} disabled={isSaving}>
              Reset
            </AdminButton>
          </div>
        </div>
      )}
    </div>
  )
}

type GatewaySurface = 'productCheckout' | 'ticketing'

interface PaymentGatewaysCardProps {
  title: string
  surface: GatewaySurface
  settings: SiteSettings
  setSettings: (s: SiteSettings) => void
}

function PaymentGatewaysCard({ title, surface, settings, setSettings }: PaymentGatewaysCardProps) {
  const surfaceState = settings.paymentGateways?.[surface] || {}
  const hubtelEnabled = surfaceState.hubtelEnabled ?? (surface === 'productCheckout')
  const paystackEnabled = surfaceState.paystackEnabled ?? false

  const update = (patch: { hubtelEnabled?: boolean; paystackEnabled?: boolean }) => {
    setSettings({
      ...settings,
      paymentGateways: {
        ...settings.paymentGateways,
        [surface]: {
          hubtelEnabled,
          paystackEnabled,
          ...patch,
        },
      },
    })
  }

  const toggleHubtel = () => update({ hubtelEnabled: !hubtelEnabled })
  const togglePaystack = () => update({ paystackEnabled: !paystackEnabled })

  const noneEnabled = !hubtelEnabled && !paystackEnabled
  const offCopy =
    surface === 'ticketing'
      ? 'Both gateways are off. Ticket purchases will fail until you enable at least one.'
      : 'Both gateways are off. Product checkout will fail until you enable at least one.'

  return (
    <AdminSection title={title}>
      <div className="space-y-3">
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

        {noneEnabled && (
          <AdminAlert variant="error">{offCopy}</AdminAlert>
        )}
      </div>
    </AdminSection>
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
    <div className="flex items-center justify-between rounded-xl border border-[var(--admin-border)] p-4">
      <div>
        <p className="text-sm font-medium text-[var(--admin-text)]">{name}</p>
        <p className="text-xs text-[var(--admin-text-muted)]">{subtitle}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${name}`}
        onClick={onToggle}
        className={`admin-press relative inline-flex h-6 w-11 items-center rounded-full transition-[background-color] duration-160 ${enabled ? 'bg-[var(--admin-accent)]' : 'bg-[var(--admin-surface-sunken)]'}`}
      >
        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-160 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}
