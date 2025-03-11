
import { DashboardSubscriber } from "./dashboard/types";
import { useTimeRange } from "./dashboard/useTimeRange";
import { useFilteredSubscribers } from "./dashboard/useFilteredSubscribers";
import { useRevenueStats } from "./dashboard/useRevenueStats";
import { useTrialUsers } from "./dashboard/useTrialUsers";
import { usePaymentStats } from "./dashboard/usePaymentStats";
import { useChartData } from "./dashboard/useChartData";
import { useInsights } from "./dashboard/useInsights";
import { Subscriber } from "./useSubscribers";

export const useDashboardData = (subscribers: Subscriber[] | undefined, plans: any[] | undefined) => {
  // Cast subscribers to the extended type needed for dashboard
  const dashboardSubscribers = subscribers as DashboardSubscriber[] | undefined;
  
  // Compose all hooks
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(dashboardSubscribers, timeRangeStartDate);
  
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  
  const { trialUsers, miniAppUsers } = useTrialUsers(filteredSubscribers);
  
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  
  const { insights } = useInsights(
    filteredSubscribers, 
    activeSubscribers, 
    inactiveSubscribers, 
    plans
  );

  return {
    // Time range
    timeRange,
    setTimeRange,
    timeRangeLabel,
    
    // Subscriber data
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    
    // Revenue data
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate,
    
    // Chart data
    memberGrowthData,
    revenueData,
    
    // Analytics 
    insights,
    trialUsers,
    miniAppUsers,
    paymentStats
  };
};
