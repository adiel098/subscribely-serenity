
export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  duration_type: 'days' | 'months' | 'years';
  community_id: string;
  features?: string[];
  trial_days?: number;
  
  // Adding fields from group_owners/hooks/types/subscription.types.ts
  interval?: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';
  is_active?: boolean;
  has_trial_period?: boolean;
  created_at?: string;
  updated_at?: string;
}
