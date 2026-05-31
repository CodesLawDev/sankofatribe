import { NextResponse } from 'next/server'
import { getPrisma, verifyToken } from '@/lib/auth-utils'
import { cookies } from 'next/headers'

const prisma = getPrisma()

async function requireAdmin() {
  const token = cookies().get('auth-token')?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  if (payload.role !== 'ADMIN' && payload.role !== 'SUPERADMIN') return null
  return payload
}

export async function PATCH(req: Request, { params }: { params: { reviewId: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { status, isFeatured } = body as { status?: string; isFeatured?: boolean }

    const data: Record<string, unknown> = {}
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      data.status = status
    }
    if (typeof isFeatured === 'boolean') {
      data.isFeatured = isFeatured
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const review = await prisma.customerReview.update({
      where: { id: params.reviewId },
      data,
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error('PATCH /api/admin/reviews/[reviewId] error:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { reviewId: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await prisma.customerReview.delete({ where: { id: params.reviewId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/reviews/[reviewId] error:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}
