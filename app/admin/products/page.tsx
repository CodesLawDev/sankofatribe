'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminButton, { AdminFilterBar, AdminSearchInput } from '@/components/admin/admin-button'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import { AdminDataTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from '@/components/admin/admin-section'
import { AdminTableSkeleton } from '@/components/admin/admin-skeleton'
import { adminBadgeClass } from '@/lib/admin/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  inStock: boolean
  imageUrl?: string
  category?: string
  collections: string[]
  sizes?: { size: string; stock: number }[]
}

export default function AdminProducts() {
  const { user, isLoading: authLoading, isMounted } = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isMounted && user && !authLoading) fetchProducts()
  }, [isMounted, user, authLoading])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/products', { credentials: 'include', cache: 'no-store' })
      if (response.ok) {
        const result = await response.json()
        setProducts(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      (product.category && product.category.toLowerCase().includes(q))
    )
  })

  return (
    <>
      <AdminPageHeader
        title="Products"
        description="Catalog synced from Sanity. Edit inventory and details in Studio."
        actions={
          <AdminButton href="/studio">
            <Plus className="h-4 w-4" />
            Add product
          </AdminButton>
        }
      />

      <AdminFilterBar>
        <AdminSearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />
      </AdminFilterBar>

      <AdminDataTable>
        {isLoading ? (
          <AdminTableSkeleton rows={6} cols={6} />
        ) : filteredProducts.length === 0 ? (
          <AdminEmptyState
            title={searchQuery ? 'No matching products' : 'No products yet'}
            description={searchQuery ? 'Try a different search term.' : 'Publish your first product in Sanity Studio.'}
            action={!searchQuery ? <AdminButton href="/studio">Open Studio</AdminButton> : undefined}
          />
        ) : (
          <table className="min-w-full">
            <AdminTableHead>
              <AdminTh>Product</AdminTh>
              <AdminTh>Category</AdminTh>
              <AdminTh>Price</AdminTh>
              <AdminTh>Stock</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Actions</AdminTh>
            </AdminTableHead>
            <tbody>
              {filteredProducts.map((product) => (
                <AdminTr key={product.id}>
                  <AdminTd>
                    <div className="flex items-center gap-3">
                      {product.imageUrl && (
                        <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">{product.collections.join(', ') || 'No collections'}</p>
                      </div>
                    </div>
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-muted)]">{product.category || '—'}</AdminTd>
                  <AdminTd>
                    <span className="font-admin-mono">GH₵{product.price.toFixed(2)}</span>
                  </AdminTd>
                  <AdminTd>
                    <span className="font-admin-mono">{product.stock}</span>
                  </AdminTd>
                  <AdminTd>
                    <span className={adminBadgeClass(product.inStock ? 'success' : 'danger')}>
                      {product.inStock ? 'In stock' : 'Out of stock'}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <Link href="/studio" className="admin-press inline-flex rounded-lg p-2 text-[var(--admin-text-muted)]">
                      <Edit className="h-4 w-4" />
                    </Link>
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </table>
        )}
      </AdminDataTable>
    </>
  )
}
