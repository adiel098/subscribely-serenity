
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
  const { timeRange, setTimeRange, timeRangeLabel } = useTimeRange();

  // Fetch subscribers for the community
  const subscribersResult = useSubscribers(communityId || '');
  const { subscribers } = subscribersResult;

  // Filter subscribers based on time range
  const filteredSubscribers = useFilteredSubscribers(subscribers, timeRange);
  
  // Calculate active and inactive subscribers
  const activeSubscribers = filteredSubscribers.filter((s) => 
    s.subscription_status === true || s.subscription_status === 'active'
  );
  const inactiveSubscribers = filteredSubscribers.filter((s) => 
    s.subscription_status === false || s.subscription_status === 'inactive'
  );

  // Get calculated stats
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = useRevenueStats(filteredSubscribers);
  const { trialUsers } = useTrialUsers(filteredSubscribers);
  const miniAppStats = useMiniAppUsers(filteredSubscribers);
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  const { insights } = useInsights(filteredSubscribers, totalRevenue);
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers, timeRange);
  const ownerInfo = useOwnerInfo(communityId);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(subscribersResult.isLoading);
  }, [subscribersResult.isLoading]);

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
    miniAppUsers: miniAppStats?.miniAppUsers || { count: 0, percentage: 0 },
    paymentStats,
    insights,
    memberGrowthData,
    revenueData,
    ownerInfo,
    isLoading
  };
};
