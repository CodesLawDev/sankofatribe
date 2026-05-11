'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Address {
  id: string
  label: string
  street: string
  city: string
  region: string | null
  postalCode: string | null
  country: string
  isDefault: boolean
}

export default function AddressManagement() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    isDefault: false,
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/customer/addresses')
      if (!response.ok) throw new Error('Failed to fetch addresses')
      const data = await response.json()
      setAddresses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setError(null)
  }

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      isDefault: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!formData.street || !formData.city || !formData.country) {
      setError('Street, city, and country are required')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      if (editingId) {
        const response = await fetch(`/api/customer/addresses/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to update address')
      } else {
        const response = await fetch('/api/customer/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!response.ok) throw new Error('Failed to create address')
      }

      await fetchAddresses()
      resetForm()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save address')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      region: address.region || '',
      postalCode: address.postalCode || '',
      country: address.country,
      isDefault: address.isDefault,
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      setError(null)
      const response = await fetch(`/api/customer/addresses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete address')
      await fetchAddresses()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete address')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Loading addresses...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Address updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Addresses</h3>
        {!showForm && (
          <Button
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 p-6 rounded-lg space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="e.g., Home, Work"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Ghana"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="123 Main Street"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Accra"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="Greater Accra"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="00000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="default"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
            />
            <label htmlFor="default" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              {isSaving ? 'Saving...' : editingId ? 'Update Address' : 'Add Address'}
            </Button>
            <Button onClick={resetForm} variant="secondary" disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length > 0 ? (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white border rounded-lg p-6 ${
                address.isDefault ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{address.label}</h4>
                  {address.isDefault && (
                    <span className="text-xs bg-brand-primary text-white px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-700">{address.street}</p>
              <p className="text-gray-600">
                {address.city}
                {address.region && `, ${address.region}`}
                {address.postalCode && ` ${address.postalCode}`}
              </p>
              <p className="text-gray-600">{address.country}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-gray-600 mb-4">No addresses saved yet</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-brand-primary text-white hover:bg-brand-primary/90"
          >
            Add Your First Address
          </Button>
        </div>
      )}
    </div>
  )
}
