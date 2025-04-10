
import { SubscriptionInterval } from "@/shared/types/subscription.types";

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
