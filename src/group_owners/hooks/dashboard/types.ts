
export interface DashboardSubscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null; // Changed from required to allow null values
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
  subscription_plan_id?: string | null; // Add this property
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

export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface TrialUserData {
  count: number;
  // Percentage of trial users who convert to paid subscriptions
  conversionRate: number;
}

// Alias for TrialUserData to maintain backward compatibility
export interface TrialUsersData {
  count: number;
  conversion: number;
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

// Alias for Insight to maintain backward compatibility
export type Insights = Insight;

export interface PaymentStatistics {
  completed: number;
  pending: number;
  failed: number;
  total: number; // Add this property to the type
}

// Additional types needed for chart data
export type ChartData = { date: string; members: number }[];
export type RevenueData = { date: string; revenue: number }[];
