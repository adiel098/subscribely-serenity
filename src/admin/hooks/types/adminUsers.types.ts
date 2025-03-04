
export type AdminUserRole = 'super_admin' | 'moderator' | 'community_owner' | 'user';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: AdminUserRole;
  status: 'active' | 'inactive' | 'suspended';
  avatar_url: string | null;
  communities_count: number;
  subscriptions_count: number;
  created_at: string;
  last_login: string | null;
}
