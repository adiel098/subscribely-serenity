
// If this file doesn't exist, we'll create it with the necessary types

export interface PaymentMethod {
  id: string;
  provider: string;
  is_active: boolean;
  config: Record<string, any>;
  owner_id: string;
  community_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type PaymentProvider = 'stripe' | 'paypal' | 'crypto';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  is_active: boolean;
  community_id: string;
  features?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  start_date: string;
  end_date: string;
  payment_method?: string;
  auto_renew?: boolean;
  created_at?: string;
  updated_at?: string;
}
