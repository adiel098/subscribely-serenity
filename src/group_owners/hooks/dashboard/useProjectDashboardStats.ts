
import { useTimeRange } from "./useTimeRange";
import { useFilteredSubscribers } from "./useFilteredSubscribers";
import { useRevenueStats } from "./useRevenueStats";
import { useTrialUsers } from "./useTrialUsers";
import { usePaymentStats } from "./usePaymentStats";
import { useInsights } from "./useInsights";
import { useChartData } from "./useChartData";
import { useProjectSubscribers } from "./useProjectSubscribers";
import { useProjectPlans } from "./useProjectPlans";
import { useProjectMiniAppUsers } from "./useProjectMiniAppUsers";
import { useProjectOwnerInfo } from "./useProjectOwnerInfo";
import { MiniAppData } from "./types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef, useMemo } from "react";

const logger = createLogger("useProjectDashboardStats");

export const useProjectDashboardStats = (projectId: string | null) => {
  // Use ref to prevent duplicate logs
  const loggedRef = useRef(false);
  
  if (projectId && !loggedRef.current) {
    logger.log("📊 useProjectDashboardStats hook initialized with projectId:", projectId);
    loggedRef.current = true;
  }
  
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  
  // Fetch subscribers data with stabilized query
  const { data: subscribersData = [], isLoading: subscribersLoading } = useProjectSubscribers(projectId);
  
  // Fetch plans data with stabilized query
  const { data: plansData = [], isLoading: plansLoading } = useProjectPlans(projectId);
  
  // Use memoized filtered data to prevent unnecessary recalculations
  const subscribersInfo = useMemo(() => {
    return useFilteredSubscribers(subscribersData || [], timeRangeStartDate);
  }, [subscribersData, timeRangeStartDate]);
  
  const { filteredSubscribers = [], activeSubscribers = [], inactiveSubscribers = [] } = subscribersInfo || {};
  
  // Memoize revenue stats
  const revenueInfo = useMemo(() => {
    return useRevenueStats(filteredSubscribers || []);
  }, [filteredSubscribers]);
  
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = revenueInfo || {};
  
  // Memoize trial users
  const trialInfo = useMemo(() => {
    return useTrialUsers(filteredSubscribers || []);
  }, [filteredSubscribers]);
  
  const { trialUsers } = trialInfo || { trialUsers: { count: 0, percentage: 0 } };
  
  // Fetch mini app users data
  const { data: miniAppUsersData = null, isLoading: miniAppUsersLoading } = 
    useProjectMiniAppUsers(projectId, activeSubscribers || []);
  
  // Create a stable mini app users object
  const miniAppUsers: MiniAppData = useMemo(() => {
    return {
      count: miniAppUsersData?.count || 0,
      nonSubscribers: miniAppUsersData?.nonSubscribers || 0
    };
  }, [miniAppUsersData]);
  
  // Memoize payment stats
  const paymentInfo = useMemo(() => {
    return usePaymentStats(filteredSubscribers || []);
  }, [filteredSubscribers]);
  
  const { paymentStats } = paymentInfo || { paymentStats: { paymentMethods: [], paymentDistribution: [] } };
  
  // Memoize insights
  const insightsInfo = useMemo(() => {
    return useInsights(
      filteredSubscribers || [],
      activeSubscribers || [],
      inactiveSubscribers || [],
      plansData || []
    );
  }, [filteredSubscribers, activeSubscribers, inactiveSubscribers, plansData]);
  
  const { insights = {}, insightsData = [] } = insightsInfo || {};
  
  // Memoize chart data
  const chartData = useMemo(() => {
    return useChartData(filteredSubscribers || []);
  }, [filteredSubscribers]);
  
  const { memberGrowthData = [], revenueData = [] } = chartData || {};
  
  // Fetch owner info
  const { data: ownerInfo = {}, isLoading: ownerLoading } = useProjectOwnerInfo(projectId);
  
  // Combine loading states
  const isLoading = subscribersLoading || plansLoading || miniAppUsersLoading || ownerLoading;
  
  // Return a stable object with default values for all properties
  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    
    filteredSubscribers: filteredSubscribers || [],
    activeSubscribers: activeSubscribers || [],
    inactiveSubscribers: inactiveSubscribers || [],
    
    totalRevenue: totalRevenue || 0,
    avgRevenuePerSubscriber: avgRevenuePerSubscriber || 0,
    conversionRate: conversionRate || 0,
    trialUsers: trialUsers || { count: 0, percentage: 0 },
    miniAppUsers,
    paymentStats: paymentStats || { paymentMethods: [], paymentDistribution: [] },
    insights: insights || {},
    insightsData: insightsData || [],
    
    memberGrowthData: memberGrowthData || [],
    revenueData: revenueData || [],
    
    ownerInfo: ownerInfo || {},
    
    isLoading
  };
};
