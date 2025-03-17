
export interface DashboardSubscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  community_id: string;
  joined_at: string;
  last_active: string | null;
  subscription_status: string;
  is_active: boolean;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  first_name: string | null;
  last_name: string | null;
  plan?: {
    id: string;
    name: string;
    price: number;
    interval: string;
  } | null;
  is_trial?: boolean;
  trial_end_date?: string | null;
  payment_status?: string;
  metadata?: {
    mini_app_accessed?: boolean;
    [key: string]: any;
  };
}

export interface ChartDataPoint {
  date: string;
  members: number;
  revenue: number;
}

export interface TrialUserData {
  count: number;
  // Percentage of trial users who convert to paid subscriptions
  conversionRate: number;
}

export interface MiniAppData {
  count: number;
  nonSubscribers: number;
}

export interface Insight {
  averageSubscriptionDuration: number;
  mostPopularPlan: string | null;
  mostPopularPlanPrice: number | null;
  mostActiveDay: string | null;
  renewalRate: number;
}

export interface PaymentStatistics {
  completed: number;
  pending: number;
  failed: number;
}
