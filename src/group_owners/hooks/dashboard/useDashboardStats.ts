
import { useSubscribers } from "@/group_owners/hooks/useSubscribers";
import { useTimeRange } from "./useTimeRange";
import { useFilteredSubscribers } from "./useFilteredSubscribers";
import { useRevenueStats } from "./useRevenueStats";
import { useTrialUsers } from "./useTrialUsers";
import { usePaymentStats } from "./usePaymentStats";
import { useInsights } from "./useInsights";
import { useChartData } from "./useChartData";
import { useFetchSubscriptionPlans } from "@/group_owners/hooks/subscription/useFetchSubscriptionPlans";
import { useMiniAppUsers } from "./useMiniAppUsers";
import { useOwnerInfo } from "./useOwnerInfo";
import { DashboardSubscriber, MiniAppData } from "./types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useDashboardStats");

export const useDashboardStats = (communityId: string) => {
  logger.log("📊 useDashboardStats hook initialized with communityId:", communityId);
  
  // Set up time range filter
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  logger.log("⏱️ Time range set to:", timeRange, "Label:", timeRangeLabel);
  
  // Fetch subscribers data
  const { subscribers, isLoading: subscribersLoading } = useSubscribers(communityId);
  logger.log("👥 Subscribers loading:", subscribersLoading, "Count:", subscribers?.length || 0);
  
  // Fetch subscription plans
  const { data: plans } = useFetchSubscriptionPlans(communityId);
  logger.log("💲 Subscription plans loaded:", plans?.length || 0);
  
  // Cast and ensure all required properties are available for DashboardSubscriber
  const dashboardSubscribers: DashboardSubscriber[] = subscribers.map(sub => ({
    ...sub,
    telegram_user_id: sub.telegram_user_id || '',   // Ensure this is never undefined
    telegram_username: sub.telegram_username || null,  // Allow null values
    community_id: sub.community_id || communityId,  // Ensure community_id is present
    joined_at: sub.joined_at || new Date().toISOString(),  // Default joined_at to now if missing
    is_active: sub.is_active ?? true,  // Default to true if missing
    last_active: sub.last_active || null,  // Allow null
    subscription_start_date: sub.subscription_start_date || null,  // Allow null
    subscription_end_date: sub.subscription_end_date || null,  // Allow null
    first_name: sub.first_name || null,  // Allow null
    last_name: sub.last_name || null  // Allow null
  }));
  
  // Filter subscribers based on time range
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(dashboardSubscribers, timeRangeStartDate);
  logger.log("🔍 Filtered subscribers:", {
    total: filteredSubscribers.length,
    active: activeSubscribers.length,
    inactive: inactiveSubscribers.length
  });
  
  // Calculate revenue statistics
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  logger.log("💰 Revenue stats:", { totalRevenue, avgRevenuePerSubscriber, conversionRate });
  
  // Get active user IDs for mini app data filtering
  const activeUserIds = activeSubscribers.map(sub => sub.telegram_user_id);
  
  // Fetch mini app users data
  const { data: miniAppUsersData, isLoading: miniAppUsersLoading } = 
    useMiniAppUsers(communityId, activeUserIds);
  
  // Get trial users information
  const { trialUsers } = useTrialUsers(filteredSubscribers);
  logger.log("🧪 Trial users:", trialUsers.count);
  
  // Use the fetched mini app users data
  const miniAppUsers: MiniAppData = {
    count: miniAppUsersData?.count || 0,
    nonSubscribers: miniAppUsersData?.nonSubscribers || 0
  };
  logger.log("📱 Mini app users:", miniAppUsers.count, "Non-subscribers:", miniAppUsers.nonSubscribers);
  
  // Calculate payment statistics
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  logger.log("💳 Payment stats calculated");
  
  // Generate insights from subscriber data
  const { insights } = useInsights(
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    plans
  );
  logger.log("🧠 Insights calculated:", {
    avgDuration: insights.averageSubscriptionDuration,
    mostPopularPlan: insights.mostPopularPlan,
    renewalRate: insights.renewalRate
  });
  
  // Prepare chart data for visualizations
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  logger.log("📈 Chart data prepared:", {
    memberDataPoints: memberGrowthData.length,
    revenueDataPoints: revenueData.length
  });

  // Fetch community owner info
  const { data: ownerInfo, isLoading: ownerLoading } = useOwnerInfo(communityId);

  // Combine loading states
  const isLoading = subscribersLoading || ownerLoading || miniAppUsersLoading;
  
  if (isLoading) {
    logger.log("⏳ Dashboard stats still loading...");
  } else {
    logger.log("✅ Dashboard stats loaded successfully");
  }
  
  return {
    // Time range data
    timeRange,
    setTimeRange,
    timeRangeLabel,
    
    // Subscribers data
    subscribers,
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    
    // Stats
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate,
    trialUsers,
    miniAppUsers,
    paymentStats,
    insights,
    
    // Chart data
    memberGrowthData,
    revenueData,
    
    // Owner info
    ownerInfo,
    
    // Loading state
    isLoading,
    
    // Add empty communities array to match group stats structure
    communities: []
  };
};
