
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

export type TimeRange = "7d" | "30d" | "90d" | "all";

export interface ChartData {
  date: string;
  members: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface PaymentStatistics {
  completed: number;
  pending: number;
  failed: number;
}

export interface TrialUsersData {
  count: number;
  conversion: number;
}

export interface MiniAppData {
  count: number;
  nonSubscribers: number;
}

export interface DashboardInsights {
  averageSubscriptionDuration: number;
  mostPopularPlan: string;
  mostPopularPlanPrice: number;
  mostActiveDay: string;
  renewalRate: number;
}

// Extended Subscriber type with properties needed for the dashboard
export interface DashboardSubscriber extends Subscriber {
  is_trial?: boolean;
  trial_end_date?: string | null;
  payment_status?: string;
  metadata?: {
    mini_app_accessed?: boolean;
  };
}
