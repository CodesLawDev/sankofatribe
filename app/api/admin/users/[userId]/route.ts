import { client } from '@/lib/sanity'
import { getAdminSession } from '@/lib/adminAuth'
import { hasPermission } from '@/lib/adminTypes'
import { hashPassword } from '@/lib/passwordUtils'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = getAdminSession()
    if (!session || !hasPermission(session.user, 'manage_users')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, firstName, lastName, role, permissions, isActive, password } = body

    const updates: any = {}

    if (email) updates.email = email
    if (firstName) updates.firstName = firstName
    if (lastName) updates.lastName = lastName
    if (role) updates.role = role
    if (permissions) updates.permissions = permissions
    if (typeof isActive === 'boolean') updates.isActive = isActive
    if (password) {
      const { hash } = hashPassword(password)
      updates.passwordHash = hash
    }

    const updatedUser = await client.patch(params.userId).set(updates).commit()

    return NextResponse.json(
      {
        success: true,
        message: 'User updated successfully',
        user: {
          _id: updatedUser._id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = getAdminSession()
    if (!session || !hasPermission(session.user, 'manage_users')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent deleting the current user
    if (params.userId === session.user._id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await client.delete(params.userId)

    return NextResponse.json(
      {
        success: true,
        message: 'User deleted successfully',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    )
  }
}
