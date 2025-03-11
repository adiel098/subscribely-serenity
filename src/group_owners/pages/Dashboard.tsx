
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/auth/contexts/AuthContext';
import { useCommunities } from '@/group_owners/hooks/useCommunities';
import { useCommunityContext } from '@/contexts/CommunityContext';
import { useSubscribers } from '@/group_owners/hooks/useSubscribers';
import { TimeFilter } from '@/group_owners/components/dashboard/TimeFilter';
import { DashboardStats } from '@/group_owners/components/dashboard/DashboardStats';
import { DashboardCharts } from '@/group_owners/components/dashboard/DashboardCharts';
import { AnalyticsOverview } from '@/group_owners/components/dashboard/AnalyticsOverview';
import { PaymentStatus } from '@/group_owners/components/dashboard/PaymentStatus';
import { TrialUsersStats } from '@/group_owners/components/dashboard/TrialUsersStats';
import { useSubscriptionPlans } from '@/group_owners/hooks/useSubscriptionPlans';

// Import all the refactored hooks
import { useTimeRange } from '@/group_owners/hooks/dashboard/useTimeRange';
import { useFilteredSubscribers } from '@/group_owners/hooks/dashboard/useFilteredSubscribers';
import { useRevenueStats } from '@/group_owners/hooks/dashboard/useRevenueStats';
import { useTrialUsers } from '@/group_owners/hooks/dashboard/useTrialUsers';
import { usePaymentStats } from '@/group_owners/hooks/dashboard/usePaymentStats';
import { useChartData } from '@/group_owners/hooks/dashboard/useChartData';
import { useInsights } from '@/group_owners/hooks/dashboard/useInsights';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: communities, isLoading } = useCommunities();
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers } = useSubscribers(selectedCommunityId || "");
  const { plans } = useSubscriptionPlans(selectedCommunityId || "");
  
  // Use the refactored hooks directly instead of the combined useDashboardData
  const { timeRange, setTimeRange, timeRangeLabel, timeRangeStartDate } = useTimeRange();
  
  const { filteredSubscribers, activeSubscribers, inactiveSubscribers } = 
    useFilteredSubscribers(subscribers, timeRangeStartDate);
  
  const { totalRevenue, avgRevenuePerSubscriber, conversionRate } = 
    useRevenueStats(filteredSubscribers);
  
  const { trialUsers, miniAppUsers } = useTrialUsers(filteredSubscribers);
  
  const { paymentStats } = usePaymentStats(filteredSubscribers);
  
  const { memberGrowthData, revenueData } = useChartData(filteredSubscribers);
  
  const { insights } = useInsights(
    filteredSubscribers, 
    activeSubscribers, 
    inactiveSubscribers, 
    plans
  );

  const addNewCommunity = () => {
    navigate('/platform-select');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Communities Yet</h2>
          <p className="text-gray-600 mb-6">Get started by connecting your first community</p>
          <Button onClick={addNewCommunity} className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Community
          </Button>
        </div>
      </div>
    );
  }

  const currentCommunity = communities.find(c => c.id === selectedCommunityId) || communities[0];
  if (!currentCommunity) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">
            Performance metrics for <span className="font-medium text-indigo-600">{currentCommunity.name}</span>
          </p>
        </div>
        
        <TimeFilter
          selectedTimeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Subscriber Statistics</h3>
        <DashboardStats
          totalSubscribers={activeSubscribers.length + inactiveSubscribers.length}
          activeSubscribers={activeSubscribers.length}
          inactiveSubscribers={inactiveSubscribers.length}
          totalRevenue={totalRevenue}
          avgRevenuePerSubscriber={avgRevenuePerSubscriber}
          conversionRate={conversionRate}
          timeRange={timeRangeLabel}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Trial Users & Mini App</h3>
        <TrialUsersStats 
          trialUsers={trialUsers}
          miniAppUsers={miniAppUsers}
          averageSubscriptionDuration={insights.averageSubscriptionDuration}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Payment Tracking</h3>
        <PaymentStatus paymentStats={paymentStats} />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Performance Charts</h3>
        <DashboardCharts
          memberGrowthData={memberGrowthData}
          revenueData={revenueData}
          dailyStats={[]} // Passing empty array as this prop isn't used anymore
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Subscription Insights</h3>
        <AnalyticsOverview
          averageSubscriptionDuration={insights.averageSubscriptionDuration}
          mostPopularPlan={insights.mostPopularPlan}
          mostPopularPlanPrice={insights.mostPopularPlanPrice}
          mostActiveDay={insights.mostActiveDay}
          renewalRate={insights.renewalRate}
        />
      </div>
    </div>
  );
};

export default Dashboard;
