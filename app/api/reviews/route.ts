import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false,
})

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const productId = searchParams.get('productId')
        const productSlug = searchParams.get('productSlug')
        const featured = searchParams.get('featured') === 'true'
        const limitParam = searchParams.get('limit')
        const page = parseInt(searchParams.get('page') || '1', 10)
        const limit = limitParam ? parseInt(limitParam, 10) : 20
        const skip = (page - 1) * limit

        const adminMode = searchParams.get('adminMode') === 'true'
        const statusFilter = searchParams.get('status') // for admin filtering

        const where: Record<string, unknown> = adminMode ? {} : { status: 'APPROVED' }
        if (statusFilter && adminMode) where.status = statusFilter
        if (!adminMode) where.status = 'APPROVED'
        if (productId) where.productId = productId
        if (productSlug) where.productSlug = productSlug
        if (featured) where.isFeatured = true

        const [reviews, total] = await Promise.all([
            prisma.customerReview.findMany({
                where,
                include: { photos: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.customerReview.count({ where }),
        ])

        return NextResponse.json({
            reviews,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error: unknown) {
        console.error('GET /api/reviews error:', error)
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            productId,
            productName,
            productSlug,
            authorName,
            authorEmail,
            instagramHandle,
            rating,
            title,
            comment,
            sizePurchased,
            fitExperience,
            recommend,
            photoUrls, // array of { url, publicId, width, height }
        } = body

        // Validation
        if (!productId || !authorName || !rating || !title || !comment) {
            return NextResponse.json(
                { error: 'Missing required fields: productId, authorName, rating, title, comment' },
                { status: 400 }
            )
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
        }

        // Write to PostgreSQL (primary source of truth)
        const review = await prisma.customerReview.create({
            data: {
                productId,
                productName: productName || 'Sankofa Tribe Product',
                productSlug: productSlug || null,
                authorName,
                authorEmail: authorEmail || null,
                instagramHandle: instagramHandle ? instagramHandle.replace('@', '') : null,
                rating: Number(rating),
                title,
                comment,
                sizePurchased: sizePurchased || null,
                fitExperience: fitExperience || null,
                recommend: recommend !== undefined ? Boolean(recommend) : true,
                photos: photoUrls && photoUrls.length > 0
                    ? {
                        create: photoUrls.map((p: { url: string; publicId: string; width?: number; height?: number }) => ({
                            url: p.url,
                            publicId: p.publicId,
                            width: p.width || null,
                            height: p.height || null,
                        })),
                    }
                    : undefined,
            },
            include: { photos: true },
        })

        // Also write to Sanity if token is available (for Sanity Studio visibility)
        if (process.env.SANITY_WRITE_TOKEN) {
            try {
                await writeClient.create({
                    _type: 'review',
                    product: { _type: 'reference', _ref: productId },
                    author: authorName,
                    email: authorEmail || undefined,
                    rating: Number(rating),
                    title,
                    comment,
                    verified: false,
                    featured: false,
                    publishedAt: new Date().toISOString(),
                    dbReviewId: review.id,
                })
            } catch (sanityErr) {
                // Non-fatal — DB is source of truth
                console.warn('Sanity write failed (non-fatal):', sanityErr)
            }
        }

        return NextResponse.json({ success: true, reviewId: review.id }, { status: 201 })
    } catch (error: unknown) {
        console.error('POST /api/reviews error:', error)
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
    }
}
