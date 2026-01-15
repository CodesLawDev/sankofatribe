import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-utils'
import { serverClient } from '@/lib/sanity-server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Admin endpoint to list products from Sanity CMS
 * GET /api/admin/products
 * Requires: Admin authentication with view_products permission
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only admins can access
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get query parameters
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')
    const search = request.nextUrl.searchParams.get('search') || ''
    const category = request.nextUrl.searchParams.get('category') || ''

    // Build GROQ query
    let query = `*[_type == "product"`

    if (search) {
      query += ` && (name match "${search}" || description match "${search}")`
    }

    if (category) {
      query += ` && category._ref == "${category}"`
    }

    query += `] | order(_updatedAt desc) [${offset}...${offset + limit}] {
      _id,
      name,
      description,
      price,
      compareAtPrice,
      minStock,
      inStock,
      image {
        asset->{ url }
      },
      category->{ name },
      collections[]->{name}
    }`

    // Get total count
    let countQuery = `count(*[_type == "product"`
    if (search) {
      countQuery += ` && (name match "${search}" || description match "${search}")`
    }
    if (category) {
      countQuery += ` && category._ref == "${category}"`
    }
    countQuery += `])`

    const [products, total] = await Promise.all([
      serverClient.fetch(query),
      serverClient.fetch(countQuery)
    ])

    // Transform products for response
    const transformedProducts = products.map((product: any) => ({
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.minStock,
      inStock: product.inStock,
      imageUrl: product.image?.asset?.url,
      category: product.category?.name,
      collections: product.collections?.map((c: any) => c.name) || [],
    }))

    return NextResponse.json(
      {
        success: true,
        data: transformedProducts,
        pagination: {
          total,
          limit,
          offset,
          pages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
