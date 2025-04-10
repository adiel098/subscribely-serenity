
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  is_active: boolean;
  project_id: string;
  community_id?: string;
  has_trial_period: boolean;
  trial_days: number;
  created_at: string;
  updated_at: string;
  duration?: number;
  duration_type?: string;
}
