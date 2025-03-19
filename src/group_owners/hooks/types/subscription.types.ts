
export interface PaymentMethod {
  id: string;
  provider: 'stripe' | 'paypal' | 'crypto';
  is_active: boolean;
  config: Record<string, any>;
  owner_id?: string;
  community_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  community_id: string;
  name: string;
  description: string | null;
  price: number;
  interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanData {
  community_id: string;
  name: string;
  description?: string;
  price: number;
  interval: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';
  features?: string[];
}
