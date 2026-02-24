'use client'

import { useState, useEffect } from 'react'
import { Heart, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WishlistItem {
  id: string
  productId: string
  addedAt: string
}

export default function WishlistManagement() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/customer/wishlist')
      if (!response.ok) throw new Error('Failed to fetch wishlist')
      const data = await response.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wishlist')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (productId: string) => {
    if (!confirm('Remove from wishlist?')) return

    try {
      setIsDeleting(productId)
      const response = await fetch(`/api/customer/wishlist/${productId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove item')
      await fetchWishlist()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item')
    } finally {
      setIsDeleting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-500">Loading wishlist...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-lg p-6 flex items-center justify-between hover:border-brand-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Product ID: {item.productId}</p>
                  <p className="text-sm text-gray-600">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleRemove(item.productId)}
                  disabled={isDeleting === item.productId}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                  variant="secondary"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No items in wishlist</p>
          <p className="text-sm text-gray-500 mb-4">Save your favorite products to view them later</p>
          <Button className="bg-brand-primary text-white hover:bg-brand-primary/90">
            Start Shopping
          </Button>
        </div>
      )}
    </div>
  )
}
