'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { User, Upload, Edit2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  profileImage: string | null
  bio: string | null
  loyaltyPoints: number
  totalOrders: number
  totalSpent: number
  registeredAt: string | null
  lastLogin: string | null
}

export default function ProfileManagement() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/customer/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        bio: data.bio || '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      const response = await fetch('/api/customer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to update profile')
      await fetchProfile()
      setIsEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-gray-700">Failed to load profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Profile updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white border border-gray-100 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Your Profile</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm text-brand-primary hover:underline"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
              {profile.profileImage ? (
                <Image
                  src={profile.profileImage}
                  alt={profile.firstName}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-brand-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-gray-600 mb-3">{profile.email}</p>
              {!isEditing && (
                <button className="inline-flex items-center gap-2 text-sm text-brand-primary hover:underline">
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          {isEditing ? (
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-brand-primary text-white hover:bg-brand-primary/90"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false)
                    setError(null)
                  }}
                  variant="secondary"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Phone</p>
                  <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Member Since</p>
                  <p className="text-gray-900">{new Date(profile.registeredAt || '').toLocaleDateString()}</p>
                </div>
              </div>
              {profile.bio && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Bio</p>
                  <p className="text-gray-900">{profile.bio}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20 p-6 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-brand-primary">{profile.totalOrders}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-0 border border-green-200 p-6 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Total Spent</p>
          <p className="text-3xl font-bold text-green-600">GH₵{Number(profile.totalSpent).toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-0 border border-purple-200 p-6 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Loyalty Points</p>
          <p className="text-3xl font-bold text-purple-600">{profile.loyaltyPoints}</p>
        </div>
      </div>
    </div>
  )
}
