
import { Subscriber } from "@/group_owners/hooks/useSubscribers";

export interface DashboardSubscriber extends Subscriber {
  // Extended properties for dashboard
  is_trial?: boolean;
  trial_end_date?: string | null;
  payment_status?: string;
  metadata?: {
    mini_app_accessed?: boolean;
    [key: string]: any;
  };
}

export interface TimeRangeData {
  timeRange: "7d" | "30d" | "90d" | "all";
  timeRangeLabel: string;
  timeRangeStartDate: Date;
}

export interface FilteredSubscriberData {
  filteredSubscribers: DashboardSubscriber[];
  activeSubscribers: DashboardSubscriber[];
  inactiveSubscribers: DashboardSubscriber[];
}

export interface RevenueData {
  totalRevenue: number;
  avgRevenuePerSubscriber: number;
  conversionRate: number;
}

export interface TrialUsersData {
  count: number;
  conversion: number;
}

export interface MiniAppData {
  count: number;
  nonSubscribers: number;
}

export interface PaymentStatistics {
  completed: number;
  pending: number;
  failed: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface ChartData {
  memberGrowthData: ChartDataPoint[];
  revenueData: ChartDataPoint[];
}

export interface Insights {
  averageSubscriptionDuration: number;
  mostPopularPlan: string;
  mostPopularPlanPrice: number;
  mostActiveDay: string;
  renewalRate: number;
}
