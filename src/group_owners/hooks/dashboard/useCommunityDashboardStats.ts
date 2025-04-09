
import { useTimeRange } from "./useTimeRange";
import { useFilteredSubscribers } from "./useFilteredSubscribers";
import { useRevenueStats } from "./useRevenueStats";
import { useTrialUsers } from "./useTrialUsers";
import { usePaymentStats } from "./usePaymentStats";
import { useInsights } from "./useInsights";
import { useChartData } from "./useChartData";
import { useSubscribers } from "@/group_owners/hooks/useSubscribers";
import { useFetchSubscriptionPlans } from "@/group_owners/hooks/subscription/useFetchSubscriptionPlans";
import { useMiniAppUsers } from "./useMiniAppUsers";
import { useOwnerInfo } from "./useOwnerInfo";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useCommunityDashboardStats");

export const useCommunityDashboardStats = (communityId: string | null) => {
  if (!communityId) {
    return {
      timeRange: "all",
      setTimeRange: () => {},
      timeRangeLabel: "All Time",
      filteredSubscribers: [],
      activeSubscribers: [],
      inactiveSubscribers: [],
      totalRevenue: 0,
      avgRevenuePerSubscriber: 0,
      conversionRate: 0,
      trialUsers: { count: 0, percentage: 0 },
      miniAppUsers: { count: 0, nonSubscribers: 0 },
      paymentStats: { paymentMethods: [], paymentDistribution: [] },
      insights: {
        averageSubscriptionDuration: 0,
        mostPopularPlan: "None",
        mostPopularPlanPrice: 0,
        renewalRate: 0,
        potentialRevenue: 0,
      },
      memberGrowthData: [],
      revenueData: [],
      ownerInfo: null,
      isLoading: false
    };
  }

  logger.log("📊 Using community dashboard stats for community ID:", communityId);
  
  // Set up time range filter
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  logger.log("⏱️ Time range set to:", timeRange);
  
  // Fetch subscribers data
  const { data: subscribers, isLoading: subscribersLoading } = useSubscribers(communityId);
  logger.log("👥 Subscribers loading:", subscribersLoading, "Count:", subscribers?.length || 0);
  
  // Fetch subscription plans
  const { data: plans, isLoading: plansLoading } = useFetchSubscriptionPlans(communityId);
  logger.log("💲 Subscription plans loaded:", plans?.length || 0);

  // Filter subscribers based on time range
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(subscribers || [], timeRangeStartDate);
  
  // Calculate revenue statistics
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers || []);
  
  // Get trial users information
  const { trialUsers } = useTrialUsers(filteredSubscribers || []);
  
  // Get active user IDs for mini app data filtering
  const activeUserIds = activeSubscribers?.map(sub => sub.telegram_user_id) || [];
  
  // Fetch mini app users data
  const { data: miniAppUsersData, isLoading: miniAppUsersLoading } = 
    useMiniAppUsers(communityId, activeUserIds);
  
  // Use the fetched mini app users data
  const miniAppUsers = {
    count: miniAppUsersData?.count || 0,
    nonSubscribers: miniAppUsersData?.nonSubscribers || 0
  };
  
  // Calculate payment statistics
  const { paymentStats } = usePaymentStats(filteredSubscribers || []);
  
  // Generate insights from subscriber data
  const { insights } = useInsights(
    filteredSubscribers || [],
    activeSubscribers || [],
    inactiveSubscribers || [],
    plans || []
  );
  
  // Prepare chart data for visualizations
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers || []);

  // Fetch community owner info
  const { data: ownerInfo, isLoading: ownerLoading } = useOwnerInfo(communityId);

  // Combine loading states
  const isLoading = subscribersLoading || plansLoading || ownerLoading || miniAppUsersLoading;
  
  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate,
    trialUsers,
    miniAppUsers,
    paymentStats,
    insights,
    
    memberGrowthData,
    revenueData,
    
    ownerInfo,
    
    isLoading
  };
};
