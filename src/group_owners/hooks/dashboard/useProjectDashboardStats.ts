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
    
    // Return default state immediately if projectId is null
    if (!projectId) {
      return DEFAULT_STATS;
    }
    
    if (!loggedRef.current) {
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
      // נשלח מערך בטוח גם אם subscribersData הוא null או undefined
      const safeSubscribersData = Array.isArray(subscribersData) ? subscribersData : [];
      return useFilteredSubscribers(safeSubscribersData, timeRangeStartDate);
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
    
    // Memoize revenue stats
    const revenueInfo = useMemo(() => {
      // וידוא שאנחנו תמיד שולחים מערך תקין
      return useRevenueStats(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
    }, [filteredSubscribers]);
    
    const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = revenueInfo || {};
    
    // Memoize trial users
    const trialInfo = useMemo(() => {
      // וידוא שאנחנו תמיד שולחים מערך תקין
      return useTrialUsers(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
    }, [filteredSubscribers]);
    
    const { trialUsers } = trialInfo || { trialUsers: { count: 0, percentage: 0 } };
    
    // Fetch mini app users data
    const { data: miniAppUsersData = null, isLoading: miniAppUsersLoading } = 
      useProjectMiniAppUsers(projectId, Array.isArray(activeSubscribers) ? activeSubscribers : []);
    
    // Create a stable mini app users object
    const miniAppUsers: MiniAppData = useMemo(() => {
      return {
        count: miniAppUsersData?.count || 0,
        nonSubscribers: miniAppUsersData?.nonSubscribers || 0
      };
    }, [miniAppUsersData]);
    
    // Memoize payment stats
    const paymentInfo = useMemo(() => {
      // וידוא שאנחנו תמיד שולחים מערך תקין
      return usePaymentStats(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
    }, [filteredSubscribers]);
    
    const { paymentStats } = paymentInfo || { paymentStats: { paymentMethods: [], paymentDistribution: [] } };
    
    // Memoize insights
    const insightsInfo = useMemo(() => {
      return useInsights(
        Array.isArray(filteredSubscribers) ? filteredSubscribers : [],
        Array.isArray(activeSubscribers) ? activeSubscribers : [],
        Array.isArray(inactiveSubscribers) ? inactiveSubscribers : [],
        Array.isArray(plansData) ? plansData : []
      );
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
      // וידוא שאנחנו תמיד שולחים מערך תקין
      return useChartData(Array.isArray(filteredSubscribers) ? filteredSubscribers : []);
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
      miniAppUsers: miniAppUsers || { count: 0, nonSubscribers: 0 },
      paymentStats: paymentStats || { paymentMethods: [], paymentDistribution: [] },
      insights: insights || {},
      insightsData: insightsData as InsightData,
      
      memberGrowthData: Array.isArray(memberGrowthData) ? memberGrowthData : [],
      revenueData: Array.isArray(revenueData) ? revenueData : [],
      
      ownerInfo: ownerInfo || {},
      
      isLoading
    };
  } catch (error) {
    // Log the error for debugging but don't throw
    console.error("Error in useProjectDashboardStats:", error);
    logger.error("Critical error in useProjectDashboardStats hook:", error);
    
    // Always return a stable object structure even in case of errors
    return DEFAULT_STATS;
  }
};
