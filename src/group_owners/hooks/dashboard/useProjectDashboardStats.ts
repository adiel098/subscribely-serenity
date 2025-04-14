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
import { InsightData, MiniAppData } from "./types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";
import { useRef, useMemo } from "react";

const logger = createLogger("useProjectDashboardStats");

// Default empty state object to ensure consistent return shape
const DEFAULT_STATS = {
  timeRange: 'last7days',
  setTimeRange: () => {},
  timeRangeLabel: '',
  
  filteredSubscribers: [],
  activeSubscribers: [],
  inactiveSubscribers: [],
  
  totalRevenue: 0,
  avgRevenuePerSubscriber: 0,
  conversionRate: 0,
  trialUsers: { count: 0, percentage: 0 },
  miniAppUsers: { count: 0, nonSubscribers: 0 },
  paymentStats: { paymentMethods: [], paymentDistribution: [] },
  insights: {},
  insightsData: {
    averageSubscriptionDuration: 0,
    mostPopularPlan: 'No Plan',
    mostPopularPlanPrice: 0,
    renewalRate: 0,
    potentialRevenue: 0
  },
  
  memberGrowthData: [],
  revenueData: [],
  
  ownerInfo: {},
  
  isLoading: false
};

export const useProjectDashboardStats = (projectId: string | null) => {
  // Use ref to prevent duplicate logs
  const loggedRef = useRef(false);

  try {
    logger.log("🚀 useProjectDashboardStats called with projectId:", projectId);
    
    // Return default state immediately if projectId is null
    if (!projectId) {
      logger.log("❌ No project ID provided, returning default stats");
      return DEFAULT_STATS;
    }
    
    if (!loggedRef.current) {
      logger.log("📊 useProjectDashboardStats hook initialized with projectId:", projectId);
      loggedRef.current = true;
    }
    
    // Get time range info - CALL HOOKS FIRST at the top level
    const defaultTimeRange = useTimeRange();
    logger.log("⏰ Time range loaded:", defaultTimeRange ? "success" : "failed");
    
    const { 
      timeRange = 'last7days', 
      setTimeRange = () => {}, 
      timeRangeLabel = 'Last 7 Days', 
      timeRangeStartDate 
    } = defaultTimeRange || {};
    
    // Fetch subscribers data with stabilized query
    const subscribersQuery = useProjectSubscribers(projectId);
    const { data: subscribersData, isLoading: subscribersLoading } = subscribersQuery;
    
    logger.log("👥 Subscribers data loaded:", {
      success: !!subscribersData,
      isLoading: subscribersLoading,
      isArray: Array.isArray(subscribersData),
      count: Array.isArray(subscribersData) ? subscribersData.length : 'not an array'
    });
    
    // Fetch plans data with stabilized query
    const plansQuery = useProjectPlans(projectId);
    const { data: plansData, isLoading: plansLoading } = plansQuery;
    
    logger.log("📋 Plans data loaded:", {
      success: !!plansData,
      isLoading: plansLoading,
      isArray: Array.isArray(plansData),
      count: Array.isArray(plansData) ? plansData.length : 'not an array'
    });
    
    // Early return for loading state
    if (subscribersLoading || plansLoading) {
      logger.log("⏳ Dashboard data is still loading");
      return {
        ...DEFAULT_STATS,
        isLoading: true,
        timeRange: timeRange,
        setTimeRange: setTimeRange,
        timeRangeLabel: timeRangeLabel
      };
    }
    
    // Call all other hooks at the top level, not inside useMemo
    const filteredSubscribersData = useFilteredSubscribers(
      Array.isArray(subscribersData) ? subscribersData : [], 
      timeRangeStartDate
    );
    
    // Get these values safely from the hook result
    const filteredSubscribers = Array.isArray(filteredSubscribersData?.filteredSubscribers) 
      ? filteredSubscribersData.filteredSubscribers 
      : [];
    const activeSubscribers = Array.isArray(filteredSubscribersData?.activeSubscribers) 
      ? filteredSubscribersData.activeSubscribers 
      : [];
    const inactiveSubscribers = Array.isArray(filteredSubscribersData?.inactiveSubscribers) 
      ? filteredSubscribersData.inactiveSubscribers 
      : [];
    
    logger.log("👥 Processed subscribers data:", {
      filteredSubscribers: filteredSubscribers.length,
      activeSubscribers: activeSubscribers.length, 
      inactiveSubscribers: inactiveSubscribers.length
    });
    
    // Call revenue hook at the top level
    const revenueInfo = useRevenueStats(
      Array.isArray(filteredSubscribers) ? filteredSubscribers : []
    );
    
    // Use destructuring with default values for safety
    const { 
      totalRevenue = 0, 
      avgRevenuePerSubscriber = 0, 
      conversionRate = 0 
    } = revenueInfo || {};
    
    // Call trial users hook at the top level
    const trialInfo = useTrialUsers(
      Array.isArray(filteredSubscribers) ? filteredSubscribers : []
    );
    
    // Use destructuring with default value for safety
    const { trialUsers = { count: 0, percentage: 0 } } = trialInfo || {};
    
    // Fetch mini app users data
    const { data: miniAppUsersData = null, isLoading: miniAppUsersLoading } = 
      useProjectMiniAppUsers(projectId, Array.isArray(activeSubscribers) ? activeSubscribers : []);
    
    // Create a stable mini app users object
    const miniAppUsers: MiniAppData = useMemo(() => {
      try {
        return {
          count: miniAppUsersData?.count || 0,
          nonSubscribers: miniAppUsersData?.nonSubscribers || 0
        };
      } catch (error) {
        logger.error("Error in mini app users calculation:", error);
        return { count: 0, nonSubscribers: 0 };
      }
    }, [miniAppUsersData]);
    
    // Call payment stats hook at the top level
    const paymentInfo = usePaymentStats(
      Array.isArray(filteredSubscribers) ? filteredSubscribers : []
    );
    
    // Use destructuring with default values for safety
    const { paymentStats } = paymentInfo || { paymentStats: { paymentMethods: [], paymentDistribution: [] } };
    
    // Call insights hook at the top level 
    const insightsData = useInsights(
      Array.isArray(filteredSubscribers) ? filteredSubscribers : [],
      Array.isArray(plansData) ? plansData : []
    );
    
    // Get chart data at the top level
    const chartData = useChartData(
      Array.isArray(subscribersData) ? subscribersData : [],
      timeRangeStartDate
    );
    
    // Destructure with safe defaults
    const memberGrowthData = Array.isArray(chartData?.memberGrowthData) 
      ? chartData.memberGrowthData 
      : [];
      
    const revenueData = Array.isArray(chartData?.revenueData) 
      ? chartData.revenueData 
      : [];
    
    // Memoize insights
    const insightsInfo = useMemo(() => {
      try {
        return { insights: insightsData };
      } catch (error) {
        logger.error("Error in insights calculation:", error);
        return { insights: {} };
      }
    }, [insightsData]);
    
    // Ensure we have properly typed insightsData
    const { insights = {} } = insightsInfo || {};
    
    // Fetch owner info
    const { data: ownerInfo = {}, isLoading: ownerLoading } = useProjectOwnerInfo(projectId);
    
    // Combine loading states
    const isLoading = miniAppUsersLoading || ownerLoading;
    
    // Final logging before returning
    logger.log("🔚 useProjectDashboardStats returning object with these arrays:", {
      filteredSubscribers: Array.isArray(filteredSubscribers),
      filteredSubscribersCount: Array.isArray(filteredSubscribers) ? filteredSubscribers.length : 'not an array',
      activeSubscribers: Array.isArray(activeSubscribers),
      activeSubscribersCount: Array.isArray(activeSubscribers) ? activeSubscribers.length : 'not an array',
      memberGrowthData: Array.isArray(memberGrowthData),
      memberGrowthDataCount: Array.isArray(memberGrowthData) ? memberGrowthData.length : 'not an array',
      revenueData: Array.isArray(revenueData),
      revenueDataCount: Array.isArray(revenueData) ? revenueData.length : 'not an array',
      paymentMethodsCount: paymentStats && Array.isArray(paymentStats.paymentMethods) 
        ? paymentStats.paymentMethods.length : 'not an array',
      paymentDistributionCount: paymentStats && Array.isArray(paymentStats.paymentDistribution)
        ? paymentStats.paymentDistribution.length : 'not an array'
    });
    
    // Return a stable object with default values for all properties
    return {
      timeRange,
      setTimeRange,
      timeRangeLabel,
      
      filteredSubscribers: Array.isArray(filteredSubscribers) ? filteredSubscribers : [],
      activeSubscribers: Array.isArray(activeSubscribers) ? activeSubscribers : [],
      inactiveSubscribers: Array.isArray(inactiveSubscribers) ? inactiveSubscribers : [],
      
      totalRevenue: totalRevenue || 0,
      avgRevenuePerSubscriber: avgRevenuePerSubscriber || 0,
      conversionRate: conversionRate || 0,
      
      trialUsers: trialUsers || { count: 0, percentage: 0 },
      miniAppUsers: miniAppUsers || { count: 0, nonSubscribers: 0 },
      
      paymentStats: paymentStats || { paymentMethods: [], paymentDistribution: [] },
      
      insights: insights || {},
      insightsData: insightsData || {
        averageSubscriptionDuration: 0,
        mostPopularPlan: 'No Plan',
        mostPopularPlanPrice: 0,
        renewalRate: 0,
        potentialRevenue: 0
      },
      
      memberGrowthData: Array.isArray(memberGrowthData) ? memberGrowthData : [],
      revenueData: Array.isArray(revenueData) ? revenueData : [],
      
      ownerInfo: ownerInfo || {},
      
      isLoading: isLoading || false
    };
  } catch (error) {
    // Log the error for debugging
    logger.error("Critical error in useProjectDashboardStats hook:", error);
    
    // Return a safe default state
    return DEFAULT_STATS;
  }
};
