'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, CheckCircle, Users, Settings, BarChart3, LogOut, TrendingUp } from 'lucide-react'
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

export default function AdminPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'users'>('overview')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const session = getAdminSession()
    if (!session) {
      router.push('/admin/login')
      return
    }

    // Check permissions
    if (!hasPermission(session.user, 'view_settings')) {
      router.push('/admin/dashboard')
      return
    }

    fetchSettings()
  }, [router])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-light tracking-wider uppercase">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {session && (
              <span className="text-sm text-gray-600">
                {session.user.firstName} {session.user.lastName} <span className="text-xs text-blue-600 ml-1">({session.user.role})</span>
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {hasPermission(session?.user || null, 'view_analytics') && (
            <Link
              href="/admin/analytics"
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-black transition-colors"
            >
              <TrendingUp className="h-8 w-8 mb-3 text-blue-600" />
              <h3 className="font-medium mb-1">Analytics</h3>
              <p className="text-xs text-gray-600">View sales trends</p>
            </Link>
          )}
          <Link
            href="/admin/team"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-black transition-colors"
          >
            <Users className="h-8 w-8 mb-3 text-green-600" />
            <h3 className="font-medium mb-1">Team</h3>
            <p className="text-xs text-gray-600">Manage users</p>
          </Link>
          <Link
            href="/admin/settings"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-black transition-colors"
          >
            <Settings className="h-8 w-8 mb-3 text-purple-600" />
            <h3 className="font-medium mb-1">Settings</h3>
            <p className="text-xs text-gray-600">Site configuration</p>
          </Link>
          <a
            href="/studio"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-black transition-colors"
          >
            <BarChart3 className="h-8 w-8 mb-3 text-orange-600" />
            <h3 className="font-medium mb-1">Studio</h3>
            <p className="text-xs text-gray-600">Sanity CMS</p>
          </a>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'settings' ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Settings
          </button>
          {hasPermission(session?.user || null, 'manage_users') && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users' ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-black'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Users
            </button>
          )}
        </div>

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

        {/* Overview Tab */}
        {activeTab === 'overview' && settings && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Site Name</h3>
              <p className="text-2xl font-light">{settings.siteName}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Admin Phone</h3>
              <p className="text-2xl font-light">{settings.adminPhone || 'Not set'}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Exchange Rate</h3>
              <p className="text-lg font-light">1 GHS = <span className="font-medium">{settings.currency.exchangeRate}</span> USD</p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && settings && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium uppercase tracking-wider mb-6">General Settings</h2>
              
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

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium uppercase tracking-wider mb-6">Currency & Exchange Rate</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Exchange Rate (GHS to USD)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">1 GHS =</span>
                    <input
                      type="number"
                      step="0.001"
                      value={settings.currency.exchangeRate}
                      onChange={(e) => setSettings({
                        ...settings,
                        currency: {
                          ...settings.currency,
                          exchangeRate: parseFloat(e.target.value) || 0,
                        },
                      })}
                      className="w-32 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-black"
                    />
                    <span className="text-sm text-gray-600">USD</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Current rate: {settings.currency.exchangeRate}</p>
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

            <div className="flex gap-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
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

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium uppercase tracking-wider mb-6">User Management</h2>
            <div className="space-y-4">
              <Link 
                href="/admin/team"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Go to Team Management →
              </Link>
              <p className="text-gray-600 text-sm">Create, edit, and manage user accounts and permissions.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
