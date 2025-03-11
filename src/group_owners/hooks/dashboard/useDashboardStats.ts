
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
  console.log("📊 useDashboardStats hook initialized with communityId:", communityId);
  
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  console.log("⏱️ Time range set to:", timeRange, "Label:", timeRangeLabel);
  
  const { data: subscribers, isLoading: subscribersLoading } = useSubscribers(communityId);
  console.log("👥 Subscribers loading:", subscribersLoading, "Count:", subscribers?.length || 0);
  
  const { data: plans } = useFetchSubscriptionPlans(communityId);
  console.log("💲 Subscription plans loaded:", plans?.length || 0);
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(subscribers, timeRangeStartDate);
  console.log("🔍 Filtered subscribers:", {
    total: filteredSubscribers.length,
    active: activeSubscribers.length,
    inactive: inactiveSubscribers.length
  });
    
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  console.log("💰 Revenue stats:", { totalRevenue, avgRevenuePerSubscriber, conversionRate });
    
  const { trialUsers, miniAppUsers } = useTrialUsers(filteredSubscribers);
  console.log("🧪 Trial users:", trialUsers.count, "Mini app users:", miniAppUsers.count);
  
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  console.log("💳 Payment stats calculated");
  
  const { insights } = useInsights(
    filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    plans
  );
  console.log("🧠 Insights calculated:", {
    avgDuration: insights.averageSubscriptionDuration,
    mostPopularPlan: insights.mostPopularPlan,
    renewalRate: insights.renewalRate
  });
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  console.log("📈 Chart data prepared:", {
    memberDataPoints: memberGrowthData.length,
    revenueDataPoints: revenueData.length
  });

  // Fetch community owner info
  const { data: ownerInfo, isLoading: ownerLoading } = useQuery({
    queryKey: ["communityOwner", communityId],
    queryFn: async () => {
      if (!communityId) {
        console.log("❌ Cannot fetch owner: No community ID provided");
        return null;
      }
      
      console.log("🔍 Fetching community owner for community ID:", communityId);
      
      const { data: community, error } = await supabase
        .from("communities")
        .select("owner_id")
        .eq("id", communityId)
        .maybeSingle();

      if (error || !community) {
        console.error("❌ Error fetching community owner:", error);
        return null;
      }

      console.log("👤 Found owner_id:", community.owner_id);

      const { data: owner, error: ownerError } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", community.owner_id)
        .maybeSingle();

      if (ownerError) {
        console.error("❌ Error fetching owner profile:", ownerError);
        return null;
      }

      console.log("✅ Successfully fetched owner profile:", owner);
      return owner;
    },
    enabled: !!communityId
  });

  const isLoading = subscribersLoading || ownerLoading;
  
  if (isLoading) {
    console.log("⏳ Dashboard stats still loading...");
  } else {
    console.log("✅ Dashboard stats loaded successfully");
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
    isLoading
  };
};
