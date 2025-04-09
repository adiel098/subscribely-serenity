
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
}
