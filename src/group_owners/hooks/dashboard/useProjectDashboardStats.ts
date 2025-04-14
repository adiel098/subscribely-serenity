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
  try {
    // Use ref to prevent duplicate logs
    const loggedRef = useRef(false);
    
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
    
    // Start with a safe object we know will have the right properties
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
    
    // Use memoized filtered data to prevent unnecessary recalculations
    const subscribersInfo = useMemo(() => {
      try {
        // נשלח מערך בטוח גם אם subscribersData הוא null או undefined
        const safeSubscribersData = Array.isArray(subscribersData) ? subscribersData : [];
        logger.log("🔄 useFilteredSubscribers starting with subscribers count:", safeSubscribersData.length);
        return useFilteredSubscribers(safeSubscribersData, timeRangeStartDate);
      } catch (error) {
        logger.error("❌ Error in filtered subscribers calculation:", error);
        return { filteredSubscribers: [], activeSubscribers: [], inactiveSubscribers: [] };
      }
    }, [subscribersData, timeRangeStartDate]);
    
    // וידוא שהערכים המוחזרים גם הם מערכים
    const filteredSubscribers = Array.isArray(subscribersInfo?.filteredSubscribers) 
      ? subscribersInfo.filteredSubscribers 
      : [];
    const activeSubscribers = Array.isArray(subscribersInfo?.activeSubscribers) 
      ? subscribersInfo.activeSubscribers 
      : [];
    const inactiveSubscribers = Array.isArray(subscribersInfo?.inactiveSubscribers) 
      ? subscribersInfo.inactiveSubscribers 
      : [];
    
    logger.log("👥 Processed subscribers data:", {
      filteredSubscribers: filteredSubscribers.length,
      activeSubscribers: activeSubscribers.length, 
      inactiveSubscribers: inactiveSubscribers.length
    });
    
    // Memoize revenue stats
    const revenueInfo = useMemo(() => {
      try {
        // וידוא שאנחנו תמיד שולחים מערך תקין
        return useRevenueStats(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
      } catch (error) {
        logger.error("Error in revenue stats calculation:", error);
        return { totalRevenue: 0, avgRevenuePerSubscriber: 0, conversionRate: 0 };
      }
    }, [filteredSubscribers]);
    
    const { totalRevenue = 0, avgRevenuePerSubscriber = 0, conversionRate = 0 } = revenueInfo || {};
    
    // Memoize trial users
    const trialInfo = useMemo(() => {
      try {
        // וידוא שאנחנו תמיד שולחים מערך תקין
        return useTrialUsers(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
      } catch (error) {
        logger.error("Error in trial users calculation:", error);
        return { trialUsers: { count: 0, percentage: 0 } };
      }
    }, [filteredSubscribers]);
    
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
    
    // Memoize payment stats
    const paymentInfo = useMemo(() => {
      try {
        // וידוא שאנחנו תמיד שולחים מערך תקין
        return usePaymentStats(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
      } catch (error) {
        logger.error("Error in payment stats calculation:", error);
        return { paymentStats: { paymentMethods: [], paymentDistribution: [] } };
      }
    }, [filteredSubscribers]);
    
    const { paymentStats } = paymentInfo || { paymentStats: { paymentMethods: [], paymentDistribution: [] } };
    
    // Memoize insights
    const insightsInfo = useMemo(() => {
      try {
        return useInsights(
          Array.isArray(filteredSubscribers) ? filteredSubscribers : [],
          Array.isArray(activeSubscribers) ? activeSubscribers : [],
          Array.isArray(inactiveSubscribers) ? inactiveSubscribers : [],
          Array.isArray(plansData) ? plansData : []
        );
      } catch (error) {
        logger.error("Error in insights calculation:", error);
        return { insights: {}, insightsData: {
          averageSubscriptionDuration: 0,
          mostPopularPlan: 'No Plan',
          mostPopularPlanPrice: 0,
          renewalRate: 0,
          potentialRevenue: 0
        } };
      }
    }, [filteredSubscribers, activeSubscribers, inactiveSubscribers, plansData]);
    
    // Ensure we have properly typed insightsData
    const { insights = {}, insightsData = {
      averageSubscriptionDuration: 0,
      mostPopularPlan: 'No Plan',
      mostPopularPlanPrice: 0,
      renewalRate: 0,
      potentialRevenue: 0
    } } = insightsInfo || {};
    
    // Memoize chart data
    const chartData = useMemo(() => {
      try {
        // וידוא שאנחנו תמיד שולחים מערך תקין
        return useChartData(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
      } catch (error) {
        logger.error("Error in chart data calculation:", error);
        return { memberGrowthData: [], revenueData: [] };
      }
    }, [filteredSubscribers]);
    
    const { memberGrowthData = [], revenueData = [] } = chartData || {};
    
    // Fetch owner info
    const { data: ownerInfo = {}, isLoading: ownerLoading } = useProjectOwnerInfo(projectId);
    
    // Combine loading states
    const isLoading = subscribersLoading || plansLoading || miniAppUsersLoading || ownerLoading;
    
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
