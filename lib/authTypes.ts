export type UserRole = 'admin' | 'manager' | 'editor';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface StoredAdminUser extends AdminUser {
  _id: string;
  password: string; // hashed
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
