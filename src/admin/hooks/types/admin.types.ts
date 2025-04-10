
export type AdminRole = 'super_admin' | 'admin' | 'moderator';
export type AdminUserRole = AdminRole | 'community_owner' | 'user';

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
  email?: string; // Added to address type compatibility issue
  name?: string;
  status?: string;
}

export interface AdminStatistics {
  users: {
    total: number;
    active: number;
    new24h: number;
    new7d: number;
    new30d: number;
  };
  communities: {
    total: number;
    active: number;
    new24h: number;
    new7d: number;
    new30d: number;
  };
  payments: {
    total: number;
    total24h: number;
    total7d: number;
    total30d: number;
    amount24h: number;
    amount7d: number;
    amount30d: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RawPlatformPayment {
  id: string;
  owner_id: string;
  plan_id: string;
  amount: number;
  transaction_id?: string;
  payment_status: string;
  payment_method?: string;
  created_at: string;
  subscription_id?: string;
  owner_email?: string;
  owner_name?: string;
  plan_name?: string;
}

export interface RawProjectPayment {
  id: string;
  project_id: string;
  plan_id: string;
  telegram_user_id: string;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
  amount: number;
  discount_amount?: number;
  original_amount?: number;
  status: string;
  payment_method?: string;
  created_at: string;
  invite_link?: string;
  project_name?: string;
  plan_name?: string;
}
