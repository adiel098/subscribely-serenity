
export type AdminRole = 'super_admin' | 'admin' | 'moderator';
export type AdminUserRole = AdminRole | 'community_owner' | 'user';

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminUserRole;
  created_at: string;
  updated_at: string;
  email: string; 
  name?: string;
  status: 'active' | 'inactive' | 'suspended';
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  communities_count?: number;
  subscriptions_count?: number;
  last_login?: string | null;
}

export interface UpdateUserStatusParams {
  userId: string;
  isActive: boolean;
}

export interface UpdateUserRoleParams {
  userId: string;
  role: AdminRole;
}

export interface GrantAdminAccessParams {
  userId: string;
  role: AdminRole;
}
