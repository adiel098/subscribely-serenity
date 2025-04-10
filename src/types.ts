
import { SubscriptionPlan } from "./telegram-mini-app/types/subscriptionTypes";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  duration_type?: 'days' | 'months' | 'years';
  community_id: string;
  features?: string[];
  trial_days?: number;
  
  // Adding fields from group_owners/hooks/types/subscription.types.ts
  interval?: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time' | 'lifetime';
  is_active?: boolean;
  has_trial_period?: boolean;
  created_at?: string;
  updated_at?: string;
  project_id?: string;
}

// This type mapping function helps convert between the two interfaces
export const mapSubscriptionPlanTypes = (plan: SubscriptionPlan): SubscriptionPlan => ({
  ...plan,
  duration: plan.duration || 30, // Default for backward compatibility
  duration_type: plan.duration_type || 'days'
});
