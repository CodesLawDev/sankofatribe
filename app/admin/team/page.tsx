'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import AdminPageHeader from '@/components/admin/admin-page-header'
import AdminSection from '@/components/admin/admin-section'
import AdminButton from '@/components/admin/admin-button'
import AdminAlert from '@/components/admin/admin-alert'
import AdminEmptyState from '@/components/admin/admin-empty-state'
import { AdminDataTable, AdminTableHead, AdminTh, AdminTr, AdminTd } from '@/components/admin/admin-section'
import { AdminPageSkeleton } from '@/components/admin/admin-skeleton'
import { adminBadgeClass, adminInputClass } from '@/lib/admin/utils'

interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  role: 'ADMIN' | 'SUPERADMIN'
  permissions: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'
  lastLogin?: string
}

interface CreateUserForm {
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'admin' | 'user'
  permissions: string[]
}

interface EditUserForm {
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'ADMIN' | 'SUPERADMIN'
  permissions: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'
}

const AVAILABLE_PERMISSIONS = [
  { value: 'view_orders', label: 'View Orders' },
  { value: 'manage_orders', label: 'Manage Orders' },
  { value: 'view_products', label: 'View Products' },
  { value: 'manage_products', label: 'Manage Products' },
  { value: 'view_customers', label: 'View Customers' },
  { value: 'manage_customers', label: 'Manage Customers' },
  { value: 'view_settings', label: 'View Settings' },
  { value: 'manage_settings', label: 'Manage Settings' },
  { value: 'view_analytics', label: 'View Analytics' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'send_sms', label: 'Send SMS' },
]

const INITIAL_FORM: CreateUserForm = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'user',
  permissions: [],
}

export default function AdminUsersPage() {
  const { user, isLoading: authLoading, isMounted } = useAdminAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState<CreateUserForm>({ ...INITIAL_FORM })
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState<EditUserForm | null>(null)

  const canManageUsers =
    user?.role === 'SUPERADMIN' || (user?.permissions || []).includes('manage_users')

  // Fetch users when authenticated
  useEffect(() => {
    if (isMounted && user && !authLoading) {
      fetchUsers()
    }
  }, [isMounted, user, authLoading])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users', { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to fetch users')
      const result = await response.json()
      setUsers(result.data?.users || [])
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load users' })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.email || !form.firstName || !form.lastName || !form.phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to create user' })
        return
      }

      setMessage({ type: 'success', text: 'User created successfully!' })
      if (data.temporaryPassword) {
        setGeneratedPassword(data.temporaryPassword)
        setShowPassword(false)
      }

      setForm({ ...INITIAL_FORM })
      setTimeout(() => {
        fetchUsers()
        setShowForm(false)
        setMessage(null)
        setGeneratedPassword(null)
      }, 2000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create user' })
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const togglePermission = (permission: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const startEdit = (target: AdminUser) => {
    if (!canManageUsers) return
    if (target.role === 'SUPERADMIN' && user?.role !== 'SUPERADMIN') return
    setShowForm(false)
    setEditingUser(target)
    setEditForm({
      email: target.email,
      firstName: target.firstName,
      lastName: target.lastName,
      phone: target.phone || '',
      role: target.role,
      permissions: target.permissions || [],
      status: target.status,
    })
  }

  const toggleEditPermission = (permission: string) => {
    if (!editForm) return
    setEditForm({
      ...editForm,
      permissions: editForm.permissions.includes(permission)
        ? editForm.permissions.filter((p) => p !== permission)
        : [...editForm.permissions, permission],
    })
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !editForm) return

    if (!editForm.email || !editForm.firstName || !editForm.lastName || !editForm.phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' })
      return
    }

    try {
      setIsUpdating(true)
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update user' })
        return
      }

      setMessage({ type: 'success', text: 'User updated successfully!' })
      setEditingUser(null)
      setEditForm(null)
      fetchUsers()
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user' })
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const resetUserPassword = async (userId: string, useTemp: boolean = true) => {
    try {
      setIsCreating(true)
      const response = await fetch('/api/admin/users/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, useTemporaryPassword: useTemp }),
      })
      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to reset password' })
        return
      }

      if (data.tempPassword) {
        setGeneratedPassword(data.tempPassword)
        setShowPassword(false)
        setMessage({ type: 'success', text: 'Temporary password generated' })
      } else {
        setGeneratedPassword(null)
        setMessage({ type: 'success', text: 'Password updated successfully' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset password' })
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  if (authLoading || !isMounted || !user) {
    return <AdminPageSkeleton />
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Team"
        description="Manage admin accounts and permissions."
        actions={
          canManageUsers ? (
            <AdminButton onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4" />
              Add user
            </AdminButton>
          ) : undefined
        }
      />

      {message && (
        <AdminAlert variant={message.type === 'success' ? 'success' : 'error'}>
          <span className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </span>
        </AdminAlert>
      )}

        {generatedPassword && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-blue-900">Temporary Password Generated</p>
              <button onClick={() => setShowPassword(!showPassword)} className="text-blue-600 hover:text-blue-800">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-blue-800 font-mono break-all">
              {showPassword ? generatedPassword : '••••••••••••'}
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Share this password with the user securely. They must change it on first login.
            </p>
          </div>
        )}

        {showForm && (
          <AdminSection title="Create new user">
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Email *</span>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={isCreating} className={adminInputClass} required />
                </label>

                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    disabled={isCreating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    required
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    disabled={isCreating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    required
                    autoComplete="family-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    disabled={isCreating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    required
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role: e.target.value as 'admin' | 'user',
                        permissions: e.target.value === 'admin' ? [] : form.permissions,
                      })
                    }
                    disabled={isCreating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin (Owner)</option>
                  </select>
                </div>
              </div>

              {form.role === 'user' && (
                <div>
                  <label className="block text-sm font-medium mb-3">Permissions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.permissions.includes(perm.value)}
                          onChange={() => togglePermission(perm.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {form.role === 'admin' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-700">
                  Admin users automatically have access to all features and settings.
                </div>
              )}

              <div className="flex gap-3">
                <AdminButton type="submit" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create user'}</AdminButton>
                <AdminButton type="button" variant="secondary" onClick={() => { setShowForm(false); setForm({ ...INITIAL_FORM }) }}>Cancel</AdminButton>
              </div>
            </form>
          </AdminSection>
        )}

        {editingUser && editForm && (
          <div className="bg-brand-cream dark:bg-gray-900 rounded-lg border border-brand-primary/10 dark:border-gray-800 p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-medium uppercase tracking-wider mb-6">Edit User</h2>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    required
                    autoComplete="given-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    required
                    autoComplete="family-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    required
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as 'ADMIN' | 'SUPERADMIN',
                        permissions: e.target.value === 'SUPERADMIN' ? [] : editForm.permissions,
                      })
                    }
                    disabled={isUpdating || editingUser.role === 'SUPERADMIN'}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SUPERADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as EditUserForm['status'],
                      })
                    }
                    disabled={isUpdating}
                    className="w-full px-4 py-2 border border-brand-primary/20 rounded focus:outline-none focus:border-brand-primary disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="DELETED">Deleted</option>
                  </select>
                </div>
              </div>

              {editForm.role === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium mb-3">Permissions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                      <label key={perm.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.permissions.includes(perm.value)}
                          onChange={() => toggleEditPermission(perm.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {editForm.role === 'SUPERADMIN' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-700">
                  Super Admin users automatically have access to all features and settings.
                </div>
              )}

              <div className="flex gap-3">
                <AdminButton type="submit" disabled={isUpdating}>{isUpdating ? 'Saving...' : 'Save changes'}</AdminButton>
                <AdminButton type="button" variant="secondary" onClick={() => { setEditingUser(null); setEditForm(null) }}>Cancel</AdminButton>
              </div>
            </form>
          </div>
        )}

        <AdminDataTable>
          {users.length === 0 ? (
            <AdminEmptyState title="No team members yet" description="Create your first admin user to get started." />
          ) : (
          <table className="w-full">
            <AdminTableHead>
              <AdminTh>Name</AdminTh>
              <AdminTh>Email</AdminTh>
              <AdminTh>Role</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Last login</AdminTh>
              <AdminTh>Actions</AdminTh>
            </AdminTableHead>
            <tbody>
              {users.map((u) => (
                <AdminTr key={u.id}>
                  <AdminTd>{u.firstName} {u.lastName}</AdminTd>
                  <AdminTd className="text-[var(--admin-text-muted)]">{u.email}</AdminTd>
                  <AdminTd>
                    <span className={adminBadgeClass(u.role === 'SUPERADMIN' ? 'accent' : 'neutral')}>
                      {u.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}
                    </span>
                  </AdminTd>
                  <AdminTd>
                    <span className={adminBadgeClass(u.status === 'ACTIVE' ? 'success' : u.status === 'SUSPENDED' ? 'warning' : 'neutral')}>
                      {u.status}
                    </span>
                  </AdminTd>
                  <AdminTd className="text-[var(--admin-text-muted)]">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</AdminTd>
                  <AdminTd>
                    {canManageUsers && (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => startEdit(u)} className="admin-press text-xs font-medium text-[var(--admin-accent)]">Edit</button>
                        <button type="button" onClick={() => resetUserPassword(u.id, true)} className="admin-press text-xs font-medium text-[var(--admin-accent)]">Reset</button>
                        <button type="button" className="admin-press text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    )}
                  </AdminTd>
                </AdminTr>
              ))}
            </tbody>
          </table>
          )}
        </AdminDataTable>
    </div>
  )
}
