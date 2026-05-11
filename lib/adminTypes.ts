export type UserRole = 'SUPERADMIN' | 'ADMIN'

export type UserPermission = 
  | 'view_orders'
  | 'manage_orders'
  | 'view_products'
  | 'manage_products'
  | 'view_customers'
  | 'manage_customers'
  | 'view_tickets'
  | 'manage_tickets'
  | 'verify_tickets'
  | 'refund_tickets'
  | 'export_tickets'
  | 'view_settings'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_users'
  | 'send_sms'

export interface AdminUser {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: UserPermission[]
  isActive: boolean
  lastLogin?: string
  createdAt?: string
}

export interface AdminSession {
  user: AdminUser
  token: string
  expiresAt: number
}

// Admin users (role='admin') automatically have all these permissions
export const ALL_PERMISSIONS: UserPermission[] = [
  'view_orders',
  'manage_orders',
  'view_products',
  'manage_products',
  'view_customers',
  'manage_customers',
  'view_tickets',
  'manage_tickets',
  'verify_tickets',
  'refund_tickets',
  'export_tickets',
  'view_settings',
  'manage_settings',
  'view_analytics',
  'manage_users',
  'send_sms',
]

export function hasPermission(user: AdminUser | null, permission: UserPermission): boolean {
  if (!user) return false
  if (user.role === 'SUPERADMIN') return true
  if (user.role === 'ADMIN') return user.permissions.includes(permission)
  return false
}

export function hasAnyPermission(user: AdminUser | null, permissions: UserPermission[]): boolean {
  if (!user) return false
  if (user.role === 'SUPERADMIN') return true
  if (user.role === 'ADMIN') return permissions.some(p => user.permissions.includes(p))
  return false
}

export function hasAllPermissions(user: AdminUser | null, permissions: UserPermission[]): boolean {
  if (!user) return false
  if (user.role === 'SUPERADMIN') return true
  if (user.role === 'ADMIN') return permissions.every(p => user.permissions.includes(p))
  return false
}
