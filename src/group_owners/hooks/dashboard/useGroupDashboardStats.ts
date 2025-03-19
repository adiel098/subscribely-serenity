
import { useTimeRange } from "./useTimeRange";
import { useFilteredSubscribers } from "./useFilteredSubscribers";
import { useRevenueStats } from "./useRevenueStats";
import { useTrialUsers } from "./useTrialUsers";
import { usePaymentStats } from "./usePaymentStats";
import { useInsights } from "./useInsights";
import { useChartData } from "./useChartData";
import { useGroupSubscribers } from "./useGroupSubscribers";
import { useGroupPlans } from "./useGroupPlans";
import { useGroupMiniAppUsers } from "./useGroupMiniAppUsers";
import { useGroupOwnerInfo } from "./useGroupOwnerInfo";
import { MiniAppData } from "./types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupDashboardStats");

export const useGroupDashboardStats = (groupId: string | null) => {
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  
  // Fetch subscribers directly for the group ID
  const { data: subscribersData, isLoading: subscribersLoading } = useGroupSubscribers(groupId);
  
  // Fetch subscription plans for the group
  const { data: plansData, isLoading: plansLoading } = useGroupPlans(groupId);
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(subscribersData, timeRangeStartDate);
  
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  
  const { trialUsers } = useTrialUsers(filteredSubscribers);
  
  // Fetch mini app users for this group
  const { data: miniAppUsersData, isLoading: miniAppUsersLoading } = 
    useGroupMiniAppUsers(groupId, activeSubscribers);
  
  const miniAppUsers: MiniAppData = {
    count: miniAppUsersData?.count || 0,
    nonSubscribers: miniAppUsersData?.nonSubscribers || 0
  };
  
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  
  const { insights } = useInsights(
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    plansData
  );
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  
  // Fetch group owner info
  const { data: ownerInfo, isLoading: ownerLoading } = useGroupOwnerInfo(groupId);
  
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
    
    memberGrowthData,
    revenueData,
    
    ownerInfo,
    
    isLoading
  };
};
