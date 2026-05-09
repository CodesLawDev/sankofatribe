import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false, // Must be false for writes
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { productId, author, email, rating, title, comment } = body

        // Basic validation - productId is required by Sanity schema
        if (!productId || !author || !rating || !title || !comment) {
            return NextResponse.json(
                { error: 'Missing required fields (productId, author, rating, title, comment)' },
                { status: 400 }
            )
        }

        if (!process.env.SANITY_API_TOKEN) {
            console.warn('SANITY_API_TOKEN is not configured. Review not saved to Sanity.')
            // Return success to frontend so UX doesn't break, but log warning
            return NextResponse.json(
                { success: true, warning: 'Review received but not saved. Please configure SANITY_API_TOKEN in Sanity.' },
                { status: 200 }
            )
        }

        // Create the document in Sanity
        const doc = {
            _type: 'review',
            product: {
                _type: 'reference',
                _ref: productId
            },
            author,
            email: email || undefined,
            rating: Number(rating),
            title,
            comment,
            verified: false,
            featured: false,
            publishedAt: new Date().toISOString(),
        }

        const result = await writeClient.create(doc)

        return NextResponse.json({ success: true, result }, { status: 201 })
    } catch (error: any) {
        console.error('Error creating review:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to submit review' },
            { status: 500 }
        )
    }
}
