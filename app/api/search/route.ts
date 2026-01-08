import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
        return NextResponse.json({ products: [] })
    }

    try {
        const searchQuery = `*[_type == "product" && (
            name match $searchTerm ||
            description match $searchTerm ||
            categories[]->name match $searchTerm
        )] | order(_createdAt desc)[0...20] {
            _id,
            name,
            slug,
            images,
            price,
            inStock,
            sizes[]{size, stock}
        }`

        const products = await client.fetch(searchQuery, {
            searchTerm: `*${query}*`
        })

        return NextResponse.json({ products })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ products: [], error: 'Search failed' }, { status: 500 })
    }
}
