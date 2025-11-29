import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'

// Load environment variables from .env.local when running outside Next.js runtime
loadEnv({ path: '.env.local' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !dataset) {
  console.error('[seed] Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET in environment.')
  process.exit(1)
}

if (!token) {
  console.error('[seed] Missing SANITY_WRITE_TOKEN. Create a token with write access in Sanity project settings.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token })

// Helper to create if not exists by _id
async function ensure(doc) {
  const existing = await client.getDocument(doc._id).catch(() => null)
  if (existing) {
    console.log(`[skip] ${doc._type} ${doc._id} already exists`)
    return existing
  }
  const created = await client.create(doc)
  console.log(`[create] ${doc._type} ${doc._id}`)
  return created
}

async function run() {
  try {
    // Categories
    const categories = [
      { _id: 'category-mens', _type: 'category', name: 'Mens', slug: { _type: 'slug', current: 'mens' } },
      { _id: 'category-womens', _type: 'category', name: 'Womens', slug: { _type: 'slug', current: 'womens' } },
      { _id: 'category-accessories', _type: 'category', name: 'Accessories', slug: { _type: 'slug', current: 'accessories' } },
      { _id: 'category-home', _type: 'category', name: 'Home', slug: { _type: 'slug', current: 'home' } },
    ]

    for (const c of categories) await ensure(c)

    // Products (simple placeholders)
    const products = [
      {
        _id: 'product-basic-tee',
        _type: 'product',
        name: 'Basic Tribe Tee',
        slug: { _type: 'slug', current: 'basic-tribe-tee' },
        price: 35,
        inStock: true,
        featured: true,
        category: { _type: 'reference', _ref: 'category-mens' },
        description: 'Soft cotton tee with Sankofa emblem.'
      },
      {
        _id: 'product-heritage-hoodie',
        _type: 'product',
        name: 'Heritage Hoodie',
        slug: { _type: 'slug', current: 'heritage-hoodie' },
        price: 68,
        inStock: true,
        featured: true,
        category: { _type: 'reference', _ref: 'category-womens' },
        description: 'Cozy hoodie celebrating heritage and resilience.'
      },
      {
        _id: 'product-tribal-cap',
        _type: 'product',
        name: 'Tribal Cap',
        slug: { _type: 'slug', current: 'tribal-cap' },
        price: 28,
        inStock: true,
        category: { _type: 'reference', _ref: 'category-accessories' },
        description: 'Adjustable cap with embroidered motif.'
      }
    ]

    for (const p of products) await ensure(p)

    // Banners
    // Banners without real images yet (image field omitted to avoid broken refs)
    const banners = [
      {
        _id: 'banner-holiday',
        _type: 'banner',
        title: 'Holiday Heat',
        subtitle: 'Seasonal warmth & style',
        textColor: 'black'
      },
      {
        _id: 'banner-new-arrivals',
        _type: 'banner',
        title: 'New Arrivals',
        subtitle: 'Fresh drops just landed',
        textColor: 'black'
      }
    ]

    for (const b of banners) await ensure(b)

    // Home Page doc
    await ensure({
      _id: 'homePage-singleton',
      _type: 'homePage',
      heroBanners: banners.map(b => ({ _type: 'reference', _ref: b._id })),
      featuredProducts: products.filter(p => p.featured).map(p => ({ _type: 'reference', _ref: p._id })),
      featuredCategories: categories.slice(0, 3).map(c => ({ _type: 'reference', _ref: c._id }))
    })

    // Site Settings
    await ensure({
      _id: 'siteSettings-singleton',
      _type: 'siteSettings',
      siteName: 'Sankofa Tribe',
      description: 'Sankofa Tribe apparel & lifestyle.',
      footerText: '© ' + new Date().getFullYear() + ' Sankofa Tribe',
      mainNavigation: [
        { title: 'Mens', link: '/category/mens' },
        { title: 'Womens', link: '/category/womens' },
        { title: 'Accessories', link: '/category/accessories' },
        { title: 'Home', link: '/category/home' }
      ],
      socialLinks: { instagram: 'https://instagram.com/placeholder' }
    })

    console.log('\n[seed] Completed successfully.')
  } catch (err) {
    console.error('[seed] Error:', err)
    process.exit(1)
  }
}

run()
