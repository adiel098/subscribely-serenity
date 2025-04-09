
import { useTrialUsers } from './dashboard/useTrialUsers';
import { useMiniAppUsers } from './dashboard/useMiniAppUsers';
import { useSubscribers } from './useSubscribers';
import { useRevenueStats } from './dashboard/useRevenueStats';
import { usePaymentStats } from './dashboard/usePaymentStats';
import { useEffect, useState } from 'react';

export const useDashboardData = (communityId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const { subscribers, isLoading: isLoadingSubscribers } = useSubscribers(communityId);
  
  // Calculate trial users stats
  const trialUsersData = useTrialUsers(subscribers);
  
  // Calculate mini app users stats
  const miniAppUsersData = useMiniAppUsers(subscribers);
  
  // Calculate revenue stats
  const revenueStats = useRevenueStats(subscribers);
  
  // Calculate payment stats
  const paymentStats = usePaymentStats(subscribers);
  
  // Update loading state
  useEffect(() => {
    setIsLoading(isLoadingSubscribers);
  }, [isLoadingSubscribers]);
  
  return {
    subscribers,
    trialUsers: trialUsersData.trialUsers,
    miniAppUsers: miniAppUsersData.miniAppUsers,
    ...revenueStats,
    paymentStats: paymentStats.paymentStats,
    isLoading
  };
};
