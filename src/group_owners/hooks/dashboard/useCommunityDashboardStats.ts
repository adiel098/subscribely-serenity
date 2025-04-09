
import { useTimeRange } from '@/group_owners/hooks/dashboard/useTimeRange';
import { useFilteredSubscribers } from '@/group_owners/hooks/dashboard/useFilteredSubscribers';
import { useRevenueStats } from '@/group_owners/hooks/dashboard/useRevenueStats';
import { useTrialUsers } from '@/group_owners/hooks/dashboard/useTrialUsers';
import { usePaymentStats } from '@/group_owners/hooks/dashboard/usePaymentStats';
import { useInsights } from '@/group_owners/hooks/dashboard/useInsights';
import { useChartData } from '@/group_owners/hooks/dashboard/useChartData';
import { useMiniAppUsers } from '@/group_owners/hooks/dashboard/useMiniAppUsers';
import { useOwnerInfo } from '@/group_owners/hooks/dashboard/useOwnerInfo';
import { useSubscribers } from '@/group_owners/hooks/useSubscribers';
import { useState, useEffect } from 'react';

export const useCommunityDashboardStats = (communityId: string | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();

  // Fetch subscribers for the community
  const subscribersResult = useSubscribers(communityId || '');
  const { subscribers } = subscribersResult;

  // Filter subscribers based on time range
  const subscribersFiltered = useFilteredSubscribers(subscribers, timeRangeStartDate);
  
  // Calculate active and inactive subscribers
  const activeSubscribers = subscribers.filter((s) => 
    s.subscription_status === 'active'
  );
  const inactiveSubscribers = subscribers.filter((s) => 
    s.subscription_status === 'inactive'
  );

  // Get calculated stats
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = useRevenueStats(subscribers);
  const { trialUsers } = useTrialUsers(subscribers);
  const miniAppStats = useMiniAppUsers(subscribers);
  const { paymentStats } = usePaymentStats(subscribers);
  const { insights } = useInsights(subscribers);
  const { memberGrowthData, revenueData } = useChartData(subscribers);
  const { data: ownerInfo, isLoading: ownerLoading } = useOwnerInfo(communityId);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(subscribersResult.isLoading || ownerLoading);
  }, [subscribersResult.isLoading, ownerLoading]);

  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    filteredSubscribers: subscribersFiltered.filteredSubscribers,
    activeSubscribers,
    inactiveSubscribers,
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate,
    trialUsers,
    miniAppUsers: {
      count: miniAppStats?.miniAppUsers?.count || 0,
      nonSubscribers: 0 // Added this to match the expected type
    },
    paymentStats,
    insights,
    memberGrowthData,
    revenueData,
    ownerInfo,
    isLoading
  };
};
