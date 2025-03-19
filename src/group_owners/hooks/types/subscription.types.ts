
// If this file doesn't exist, we'll create it with the necessary types
export type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'inactive';

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

export type SubscriptionInterval = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  interval: SubscriptionInterval;
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
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  payment_method?: string;
  auto_renew?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubscriptionPlanData {
  community_id: string;
  name: string;
  description?: string;
  price: number;
  interval: SubscriptionInterval;
  features?: string[];
}
