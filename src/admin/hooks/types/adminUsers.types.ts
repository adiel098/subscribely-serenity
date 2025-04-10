
export type AdminRole = 'super_admin' | 'admin' | 'moderator';
export type AdminUserRole = AdminRole | 'community_owner' | 'user';

export interface AdminUser {
  id: string;
  user_id?: string; // Make this optional since we're using 'id' as primary identifier
  role: AdminUserRole;
  status: 'active' | 'inactive' | 'suspended';
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string;
  avatar_url?: string | null;
  communities_count?: number;
  subscriptions_count?: number;
  created_at: string;
  updated_at?: string;
  last_login?: string | null;
}

export interface UpdateUserStatusParams {
  userId: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface UpdateUserRoleParams {
  userId: string;
  role: AdminRole;
}

export interface GrantAdminAccessParams {
  userId: string;
  role: AdminRole;
}
