
import React from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { DashboardStats } from "@/group_owners/components/dashboard/DashboardStats";
import { TimeFilter } from "@/group_owners/components/dashboard/TimeFilter";
import { DashboardCharts } from "@/group_owners/components/dashboard/DashboardCharts";
import { TrialUsersStats } from "@/group_owners/components/dashboard/TrialUsersStats";
import { PaymentStatus } from "@/group_owners/components/dashboard/PaymentStatus";
import { AnalyticsOverview } from "@/group_owners/components/dashboard/AnalyticsOverview";
import { useDashboardStats } from "@/group_owners/hooks/dashboard/useDashboardStats";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/auth/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { selectedCommunityId } = useCommunityContext();
  const {
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
    
    isLoading
  } = useDashboardStats(selectedCommunityId || "");

  // Get first name from user metadata
  const firstName = user?.user_metadata?.first_name || 'there';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hello 👋 {firstName}
          </h1>
          <p className="text-gray-600 mt-1">
            Overview of your community's performance and metrics
          </p>
        </div>
        <TimeFilter
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </div>

      <DashboardStats
        totalSubscribers={filteredSubscribers.length}
        activeSubscribers={activeSubscribers.length}
        inactiveSubscribers={inactiveSubscribers.length}
        totalRevenue={totalRevenue}
        avgRevenuePerSubscriber={avgRevenuePerSubscriber}
        conversionRate={conversionRate}
        timeRange={timeRangeLabel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DashboardCharts
          memberGrowthData={memberGrowthData.map(d => ({ date: d.date, value: d.members }))}
          revenueData={revenueData.map(d => ({ date: d.date, value: d.revenue }))}
          timeRange={timeRangeLabel}
        />
      </div>

      <div className="mt-6">
        <TrialUsersStats
          trialUsers={trialUsers}
          miniAppUsers={miniAppUsers}
          averageSubscriptionDuration={insights.averageSubscriptionDuration}
        />
      </div>

      <div className="mt-6">
        <PaymentStatus
          paymentStats={paymentStats}
        />
      </div>

      <div className="mt-6">
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
