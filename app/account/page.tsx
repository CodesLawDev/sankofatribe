'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  User,
  Package,
  Heart,
  Settings,
  Lock,
  MapPin,
  LogOut,
  AlertCircle,
  Loader,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/breadcrumbs'
import ProfileManagement from '@/components/account/profile-management'
import AddressManagement from '@/components/account/address-management'
import OrderHistory from '@/components/account/order-history'
import WishlistManagement from '@/components/account/wishlist-management'
import SecurityManagement from '@/components/account/security-management'
import PreferencesManagement from '@/components/account/preferences-management'

type TabId = 'profile' | 'addresses' | 'orders' | 'wishlist' | 'security' | 'preferences'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
}

const TABS = [
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'addresses' as const, label: 'Addresses', icon: MapPin },
  { id: 'orders' as const, label: 'Orders', icon: Package },
  { id: 'wishlist' as const, label: 'Wishlist', icon: Heart },
  { id: 'security' as const, label: 'Security', icon: Lock },
  { id: 'preferences' as const, label: 'Preferences', icon: Settings },
]

import { Suspense } from 'react'

function AccountContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab') as TabId | null
  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || 'profile')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (tabFromUrl && TABS.find((t) => t.id === tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data.user)
        setIsAuthenticated(true)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    // Update URL without reload
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tabId)
    window.history.pushState({}, '', url.toString())
  }


  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600">Please log in to view your account</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 md:py-16">
        <Breadcrumbs items={[{ label: 'Account' }]} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg p-6 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-brand-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-medium text-gray-900 truncate">
                    {userProfile.firstName} {userProfile.lastName}
                  </h2>
                  <p className="text-xs text-gray-600 truncate">{userProfile.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-left">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div>
                <h1 className="text-3xl font-bold mb-2">Profile</h1>
                <p className="text-gray-600 mb-6">Manage your personal information</p>
                <ProfileManagement />
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <h1 className="text-3xl font-bold mb-2">Addresses</h1>
                <p className="text-gray-600 mb-6">Manage your delivery addresses</p>
                <AddressManagement />
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h1 className="text-3xl font-bold mb-2">Orders</h1>
                <p className="text-gray-600 mb-6">View your order history and track shipments</p>
                <OrderHistory />
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h1 className="text-3xl font-bold mb-2">Wishlist</h1>
                <p className="text-gray-600 mb-6">Save your favorite products for later</p>
                <WishlistManagement />
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h1 className="text-3xl font-bold mb-2">Security</h1>
                <p className="text-gray-600 mb-6">Manage your password and account security</p>
                <SecurityManagement />
              </div>
            )}

            {activeTab === 'preferences' && (
              <div>
                <h1 className="text-3xl font-bold mb-2">Preferences</h1>
                <p className="text-gray-600 mb-6">Control your communication preferences</p>
                <PreferencesManagement />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}
