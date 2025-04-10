
export type SubscriptionInterval = 
  | 'monthly'
  | 'quarterly' 
  | 'half_yearly'
  | 'yearly'
  | 'lifetime'
  | 'one_time';
  
export const subscriptionIntervalMapping = {
  'monthly': 'Monthly',
  'quarterly': 'Quarterly',
  'half_yearly': 'Half Yearly',
  'yearly': 'Yearly',
  'lifetime': 'Lifetime',
  'one_time': 'One Time'
};

// Map between different naming conventions for intervals
export const subscriptionIntervalMap = {
  'monthly': 'monthly',
  'quarterly': 'quarterly',
  'half_yearly': 'half-yearly',
  'half-yearly': 'half_yearly',
  'yearly': 'yearly',
  'lifetime': 'lifetime',
  'one_time': 'one-time',
  'one-time': 'one_time'
};

export const convertSubscriptionInterval = (interval: string): SubscriptionInterval => {
  return subscriptionIntervalMap[interval as keyof typeof subscriptionIntervalMap] as SubscriptionInterval || 'monthly';
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: SubscriptionInterval;
  features: string[];
  is_active: boolean;
  project_id: string;
  community_id?: string;
  has_trial_period: boolean;
  trial_days: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionPlanParams {
  name: string;
  description: string;
  price: number;
  interval: SubscriptionInterval;
  project_id: string;
  community_id?: string;
  features?: string[];
  is_active?: boolean;
  has_trial_period?: boolean;
  trial_days?: number;
}

export interface PaymentMethod {
  id: string;
  provider: string;
  is_active: boolean;
  config: Record<string, any>;
  owner_id?: string;
  community_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodInput {
  provider: string;
  config: Record<string, any>;
  is_active?: boolean;
  owner_id?: string;
  community_id?: string;
}
