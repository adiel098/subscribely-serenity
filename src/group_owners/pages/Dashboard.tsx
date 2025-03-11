
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
import { useDashboardData } from '@/group_owners/hooks/useDashboardData';
import { useSubscriptionPlans } from '@/group_owners/hooks/useSubscriptionPlans';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: communities, isLoading } = useCommunities();
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers } = useSubscribers(selectedCommunityId || "");
  const { plans } = useSubscriptionPlans(selectedCommunityId || "");
  
  const {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    activeSubscribers,
    inactiveSubscribers,
    totalRevenue,
    avgRevenuePerSubscriber,
    conversionRate,
    memberGrowthData,
    revenueData,
    dailyStats,
    insights
  } = useDashboardData(subscribers, plans);

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl mb-6">
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

      <DashboardStats
        totalSubscribers={activeSubscribers.length + inactiveSubscribers.length}
        activeSubscribers={activeSubscribers.length}
        inactiveSubscribers={inactiveSubscribers.length}
        totalRevenue={totalRevenue}
        avgRevenuePerSubscriber={avgRevenuePerSubscriber}
        conversionRate={conversionRate}
        timeRange={timeRangeLabel}
      />

      <DashboardCharts
        memberGrowthData={memberGrowthData}
        revenueData={revenueData}
        dailyStats={dailyStats}
      />

      <AnalyticsOverview
        averageSubscriptionDuration={insights.averageSubscriptionDuration}
        mostPopularPlan={insights.mostPopularPlan}
        mostPopularPlanPrice={insights.mostPopularPlanPrice}
        mostActiveDay={insights.mostActiveDay}
        renewalRate={insights.renewalRate}
      />
    </div>
  );
};

export default Dashboard;
