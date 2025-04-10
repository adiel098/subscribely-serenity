
import { SubscriptionPlan } from "../types/subscriptionTypes";

export interface GlobalPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  is_active: boolean;
}

export const convertToGlobalPlans = (plans: any[]): SubscriptionPlan[] => {
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || '',
    price: plan.price || 0,
    interval: plan.interval || 'monthly',
    features: plan.features || [],
    is_active: plan.is_active !== false,
    project_id: plan.project_id || '',
    community_id: plan.community_id || '',
    has_trial_period: plan.has_trial_period || false,
    trial_days: plan.trial_days || 0,
    created_at: plan.created_at || new Date().toISOString(),
    updated_at: plan.updated_at || new Date().toISOString(),
    duration: 30,
    duration_type: 'days'
  }));
};
