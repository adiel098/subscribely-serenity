
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
import { useState, useEffect, useMemo } from 'react';

export const useCommunityDashboardStats = (communityId: string | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();

  // Fetch subscribers for the community
  const subscribersResult = useSubscribers(communityId || '');
  const { subscribers = [] } = subscribersResult;

  // Filter subscribers based on time range - using useMemo to avoid unnecessary recalculations
  const subscribersFiltered = useMemo(() => {
    return useFilteredSubscribers(subscribers || [], timeRangeStartDate);
  }, [subscribers, timeRangeStartDate]);
  
  // Calculate active and inactive subscribers
  const activeSubscribers = useMemo(() => {
    return (subscribers || []).filter((s) => 
      s?.subscription_status === 'active'
    );
  }, [subscribers]);
  
  const inactiveSubscribers = useMemo(() => {
    return (subscribers || []).filter((s) => 
      s?.subscription_status !== 'active'
    );
  }, [subscribers]);

  // Get calculated stats with useMemo
  const revenueStats = useMemo(() => {
    return useRevenueStats(subscribers || []);
  }, [subscribers]);
  
  const trialUsersInfo = useMemo(() => {
    return useTrialUsers(subscribers || []);
  }, [subscribers]);
  
  const miniAppStats = useMemo(() => {
    return useMiniAppUsers(subscribers || []);
  }, [subscribers]);
  
  const paymentStatsInfo = useMemo(() => {
    return usePaymentStats(subscribers || []);
  }, [subscribers]);
  
  const insightsInfo = useMemo(() => {
    return useInsights(subscribers || []);
  }, [subscribers]);
  
  const chartDataInfo = useMemo(() => {
    return useChartData(subscribers || []);
  }, [subscribers]);
  
  const { data: ownerInfo = {}, isLoading: ownerLoading } = useOwnerInfo(communityId);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(subscribersResult.isLoading || ownerLoading);
  }, [subscribersResult.isLoading, ownerLoading]);

  return {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    filteredSubscribers: subscribersFiltered?.filteredSubscribers || [],
    activeSubscribers: activeSubscribers || [],
    inactiveSubscribers: inactiveSubscribers || [],
    totalRevenue: revenueStats?.totalRevenue || 0,
    avgRevenuePerSubscriber: revenueStats?.avgRevenuePerSubscriber || 0,
    conversionRate: revenueStats?.conversionRate || 0,
    trialUsers: trialUsersInfo?.trialUsers || { count: 0, percentage: 0 },
    miniAppUsers: {
      count: miniAppStats?.miniAppUsers?.count || 0,
      nonSubscribers: 0 // Default value if missing
    },
    paymentStats: paymentStatsInfo?.paymentStats || { paymentMethods: [], paymentDistribution: [] },
    insights: insightsInfo?.insights || {},
    insightsData: insightsInfo?.insightsData || [], // Default to empty array if undefined
    memberGrowthData: chartDataInfo?.memberGrowthData || [],
    revenueData: chartDataInfo?.revenueData || [],
    ownerInfo: ownerInfo || {},
    isLoading,
    communities: [] // Default empty array
  };
};
