
export interface MiniAppData {
  count: number;
  nonSubscribers: number;
}

export interface DashboardSubscriber {
  id: string;
  telegram_user_id: string;
  telegram_username: string | null;
  community_id: string;
  joined_at: string;
  is_active: boolean;
  last_active: string | null;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  first_name: string | null;
  last_name: string | null;
  plan?: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features?: string[];
  } | null;
}

// Add missing types for charts
export interface ChartDataPoint {
  date: string;
  members?: number;
  subscribers?: number;
  revenue?: number;
}

// Add missing type for payment statistics
export interface PaymentStatistics {
  completed: number;
  pending: number;
  failed: number;
  paymentMethods: {
    name: string;
    count: number;
  }[];
  paymentDistribution: {
    name: string;
    value: number;
  }[];
}

// Add missing type for trial users data
export interface TrialUsersData {
  count: number;
  percentage: number;
}

// InsightData type for InsightsPanel component
export interface InsightData {
  averageSubscriptionDuration: number;
  mostPopularPlan: string;
  mostPopularPlanPrice: number;
  renewalRate: number;
  potentialRevenue?: number;
}
