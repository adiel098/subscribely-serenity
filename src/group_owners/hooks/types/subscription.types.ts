
export interface SubscriptionPlan {
  id: string;
  community_id?: string;
  group_id?: string;
  name: string;
  description: string | null;
  price: number;
  interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanData {
  community_id?: string;
  group_id?: string;
  name: string;
  description?: string;
  price: number;
  interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';
  features?: string[];
}

export interface PlatformSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired';
  created_at: string;
  expires_at: string | null;
  subscription_data?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal' | 'crypto' | 'telegram';
  is_active: boolean;
  is_default?: boolean;
  config: Record<string, any>;
  community_id: string;
  created_at: string;
  updated_at: string | null;
}
