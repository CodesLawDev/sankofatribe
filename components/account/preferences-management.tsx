'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Preferences {
  emailMarketing: boolean
  smsMarketing: boolean
  orderUpdates: boolean
  newsletters: boolean
  productRecommendations: boolean
  promotions: boolean
}

export default function PreferencesManagement() {
  const [preferences, setPreferences] = useState<Preferences>({
    emailMarketing: true,
    smsMarketing: false,
    orderUpdates: true,
    newsletters: true,
    productRecommendations: true,
    promotions: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/customer/preferences')
      if (!response.ok) throw new Error('Failed to fetch preferences')
      const data = await response.json()
      setPreferences({
        emailMarketing: data.emailMarketing ?? true,
        smsMarketing: data.smsMarketing ?? false,
        orderUpdates: data.orderUpdates ?? true,
        newsletters: data.newsletters ?? true,
        productRecommendations: data.productRecommendations ?? true,
        promotions: data.promotions ?? true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
    setError(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/customer/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) throw new Error('Failed to update preferences')

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Loading preferences...</div>
      </div>
    )
  }

  const preferenceSections = [
    {
      title: 'Email Communications',
      icon: Mail,
      preferences: [
        {
          key: 'orderUpdates' as const,
          label: 'Order Updates',
          description: 'Get notifications about your order status',
        },
        {
          key: 'emailMarketing' as const,
          label: 'Marketing Emails',
          description: 'Receive promotional offers and updates',
        },
        {
          key: 'newsletters' as const,
          label: 'Newsletters',
          description: 'Subscribe to our regular newsletters',
        },
      ],
    },
    {
      title: 'SMS Communications',
      icon: MessageSquare,
      preferences: [
        {
          key: 'smsMarketing' as const,
          label: 'SMS Marketing',
          description: 'Receive promotional offers via SMS',
        },
      ],
    },
    {
      title: 'Recommendations',
      icon: Bell,
      preferences: [
        {
          key: 'productRecommendations' as const,
          label: 'Product Recommendations',
          description: 'Get personalized product suggestions',
        },
        {
          key: 'promotions' as const,
          label: 'Special Promotions',
          description: 'Be notified about exclusive deals',
        },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Preferences updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Preference Sections */}
      {preferenceSections.map((section) => {
        const Icon = section.icon

        return (
          <div key={section.title} className="bg-white border border-gray-100 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-gray-900">{section.title}</h3>
            </div>

            <div className="space-y-4">
              {section.preferences.map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pref.label}</p>
                    <p className="text-sm text-gray-600">{pref.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(pref.key)}
                    disabled={isSaving}
                    className={`ml-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors ${
                      preferences[pref.key]
                        ? 'bg-brand-primary'
                        : 'bg-gray-300'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        preferences[pref.key] ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-brand-primary text-white hover:bg-brand-primary/90"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-sm text-blue-800">
          💡 You can always update these preferences anytime. We respect your privacy and will
          never share your information with third parties.
        </p>
      </div>
    </div>
  )
}
