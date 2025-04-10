
// Import the SubscriptionPlan type with an alias to avoid naming conflict
import { SubscriptionPlan as TelegramSubscriptionPlan } from "./telegram-mini-app/types/subscriptionTypes";

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
  project_id?: string;
}

// This type mapping function helps convert between the two interfaces
export const mapSubscriptionPlanTypes = (plan: TelegramSubscriptionPlan | SubscriptionPlan): SubscriptionPlan => {
  // Create a new object with required fields and safe defaults
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description || '',
    price: plan.price,
    duration: plan.duration || 30, // Default for backward compatibility
    duration_type: (plan.duration_type as 'days' | 'months' | 'years') || 'days',
    community_id: plan.community_id || '',
    features: plan.features || [],
    interval: plan.interval as any,
    is_active: plan.is_active,
    has_trial_period: plan.has_trial_period,
    trial_days: plan.trial_days,
    created_at: plan.created_at,
    updated_at: plan.updated_at,
    project_id: plan.project_id
  };
};
