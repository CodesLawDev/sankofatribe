import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

const PRODUCTS_PER_PAGE = 24

const PRODUCT_FIELDS = `{
  _id,
  name,
  slug,
  images,
  price,
  audience,
  inStock,
  featured,
  sizes[]{ size, stock },
  colors,
  soldCount,
  hasDiscount,
  discountType,
  discountValue,
  discountStartDate,
  discountEndDate,
  "categories": categories[]-> { _id, name, slug }
}`

/**
 * GET /api/products?page=1&limit=24&category=&audience=&sortBy=newest
 *
 * Returns paginated products with total count.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || String(PRODUCTS_PER_PAGE), 10)))
    const category = url.searchParams.get('category') || ''
    const audience = url.searchParams.get('audience') || ''
    const sortBy = url.searchParams.get('sortBy') || 'newest'

    // Build filter
    const filters: string[] = ['_type == "product"']
    const params: Record<string, any> = {}

    if (category) {
      filters.push('$category in categories[]->slug.current')
      params.category = category
    }
    if (audience) {
      filters.push('audience == $audience')
      params.audience = audience
    }

    const filterStr = filters.join(' && ')

    // Sort
    let orderClause = '_createdAt desc'
    switch (sortBy) {
      case 'price-asc': orderClause = 'price asc'; break
      case 'price-desc': orderClause = 'price desc'; break
      case 'popular': orderClause = 'soldCount desc'; break
      case 'newest':
      default: orderClause = '_createdAt desc'; break
    }

    const start = (page - 1) * limit
    const end = start + limit

    // Parallel: count + page
    const [total, products] = await Promise.all([
      client.fetch<number>(`count(*[${filterStr}])`, params, { next: { revalidate: 60 } }),
      client.fetch(
        `*[${filterStr}] | order(${orderClause}) [${start}...${end}] ${PRODUCT_FIELDS}`,
        params,
        { next: { revalidate: 60 } }
      ),
    ])

    return NextResponse.json({
      products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: end < total,
    })
  } catch (error) {
    console.error('Product listing error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
