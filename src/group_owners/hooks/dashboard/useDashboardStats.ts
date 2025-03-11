
import { useSubscribers } from "@/group_owners/hooks/useSubscribers";
import { useTimeRange } from "./useTimeRange";
import { useFilteredSubscribers } from "./useFilteredSubscribers";
import { useRevenueStats } from "./useRevenueStats";
import { useTrialUsers } from "./useTrialUsers";
import { usePaymentStats } from "./usePaymentStats";
import { useInsights } from "./useInsights";
import { useChartData } from "./useChartData";
import { useFetchSubscriptionPlans } from "@/group_owners/hooks/subscription/useFetchSubscriptionPlans";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = (communityId: string) => {
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  const { data: subscribers, isLoading: subscribersLoading } = useSubscribers(communityId);
  const { data: plans } = useFetchSubscriptionPlans(communityId);
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(subscribers, timeRangeStartDate);
    
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
    
  const { trialUsers, miniAppUsers } = useTrialUsers(filteredSubscribers);
  
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  
  const { insights } = useInsights(
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    plans
  );
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);

  // Fetch community owner info
  const { data: ownerInfo, isLoading: ownerLoading } = useQuery({
    queryKey: ["communityOwner", communityId],
    queryFn: async () => {
      if (!communityId) return null;
      
      const { data: community, error } = await supabase
        .from("communities")
        .select("owner_id")
        .eq("id", communityId)
        .single();

      if (error || !community) {
        console.error("Error fetching community owner:", error);
        return null;
      }

      const { data: owner, error: ownerError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", community.owner_id)
        .single();

      if (ownerError) {
        console.error("Error fetching owner profile:", ownerError);
        return null;
      }

      return owner;
    },
    enabled: !!communityId
  });

  const isLoading = subscribersLoading || ownerLoading;
  
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
    isLoading
  };
};
