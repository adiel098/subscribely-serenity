
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
import { useRef } from "react";

const logger = createLogger("useProjectDashboardStats");

export const useProjectDashboardStats = (projectId: string | null) => {
  const loggedRef = useRef(false);
  
  if (!loggedRef.current && projectId) {
    logger.log("📊 useProjectDashboardStats hook initialized with projectId:", projectId);
    loggedRef.current = true;
  }
  
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  
  const { data: subscribersData, isLoading: subscribersLoading } = useProjectSubscribers(projectId);
  
  const { data: plansData, isLoading: plansLoading } = useProjectPlans(projectId);
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(subscribersData, timeRangeStartDate);
  
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  
  const { trialUsers } = useTrialUsers(filteredSubscribers);
  
  const { data: miniAppUsersData, isLoading: miniAppUsersLoading } = 
    useProjectMiniAppUsers(projectId, activeSubscribers);
  
  const miniAppUsers: MiniAppData = {
    count: miniAppUsersData?.count || 0,
    nonSubscribers: miniAppUsersData?.nonSubscribers || 0
  };
  
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  
  const { insights, insightsData } = useInsights(
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    plansData
  );
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  
  const { data: ownerInfo, isLoading: ownerLoading } = useProjectOwnerInfo(projectId);
  
  const isLoading = 
    subscribersLoading || 
    plansLoading || 
    miniAppUsersLoading || 
    ownerLoading;
  
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
    insightsData,
    
    memberGrowthData,
    revenueData,
    
    ownerInfo,
    
    isLoading
  };
};
