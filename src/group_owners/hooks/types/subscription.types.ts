
export type SubscriptionInterval = 
  | "monthly" 
  | "quarterly" 
  | "half_yearly" 
  | "yearly" 
  | "one-time" 
  | "lifetime";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  interval: SubscriptionInterval;
  features: string[];
  is_active: boolean;
  project_id: string;
  community_id?: string | null;
  has_trial_period: boolean;
  trial_days: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePlanParams {
  name: string;
  description?: string | null;
  price: number;
  interval: SubscriptionInterval;
  features: string[];
  project_id: string;
  community_id?: string;
  has_trial_period?: boolean;
  trial_days?: number;
}

export interface UpdatePlanParams {
  id: string;
  name?: string;
  description?: string | null;
  price?: number;
  interval?: SubscriptionInterval;
  features?: string[];
  has_trial_period?: boolean;
  trial_days?: number;
  updates?: Partial<SubscriptionPlan>; // Add this for compatibility
}

export interface TogglePlanStatusParams {
  id: string;
  is_active: boolean;
}
