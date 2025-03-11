
import React, { useEffect } from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { DashboardStats } from "@/group_owners/components/dashboard/DashboardStats";
import { TimeFilter } from "@/group_owners/components/dashboard/TimeFilter";
import { DashboardCharts } from "@/group_owners/components/dashboard/DashboardCharts";
import { TrialUsersStats } from "@/group_owners/components/dashboard/TrialUsersStats";
import { PaymentStatus } from "@/group_owners/components/dashboard/PaymentStatus";
import { AnalyticsOverview } from "@/group_owners/components/dashboard/AnalyticsOverview";
import { PaymentAnalytics } from "@/group_owners/components/dashboard/PaymentAnalytics";
import { useDashboardStats } from "@/group_owners/hooks/dashboard/useDashboardStats";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
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
    
    ownerInfo,
    
    isLoading
  } = useDashboardStats(selectedCommunityId || "");

  // Get the owner's first name or use a fallback
  const ownerFirstName = ownerInfo?.first_name || 'there';

  useEffect(() => {
    console.log("🔍 Dashboard loaded with community ID:", selectedCommunityId);
    console.log("👤 Owner info:", ownerInfo);
    
    if (!ownerInfo) {
      console.log("⚠️ Owner info not found. This might indicate a problem with data fetching.");
    } else {
      console.log("✅ Owner info loaded successfully:", ownerFirstName);
    }
    
    console.log("📊 Dashboard statistics:", {
      subscribersCount: filteredSubscribers.length,
      activeCount: activeSubscribers.length,
      inactiveCount: inactiveSubscribers.length,
      revenue: totalRevenue
    });
  }, [selectedCommunityId, ownerInfo, filteredSubscribers, activeSubscribers, inactiveSubscribers, totalRevenue, ownerFirstName]);

  if (isLoading) {
    console.log("⏳ Dashboard is loading...");
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  console.log("✅ Dashboard render completed for community:", selectedCommunityId);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hello 👋 {ownerFirstName}
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

      <div className="flex flex-wrap gap-6 mt-6 justify-center md:justify-start">
        <DashboardCharts
          memberGrowthData={memberGrowthData.map(d => ({ date: d.date, value: d.members }))}
          revenueData={revenueData.map(d => ({ date: d.date, value: d.revenue }))}
          timeRange={timeRangeLabel}
        />
        
        <AnalyticsOverview
          averageSubscriptionDuration={insights.averageSubscriptionDuration}
          mostPopularPlan={insights.mostPopularPlan}
          mostPopularPlanPrice={insights.mostPopularPlanPrice}
          mostActiveDay={insights.mostActiveDay}
          renewalRate={insights.renewalRate}
        />
      </div>

      <div className="flex flex-wrap gap-6 mt-6 justify-center md:justify-start">
        <PaymentAnalytics
          paymentStats={paymentStats}
        />
      </div>

      <div className="mt-6">
        <TrialUsersStats
          trialUsers={trialUsers}
          miniAppUsers={miniAppUsers}
          averageSubscriptionDuration={insights.averageSubscriptionDuration}
        />
      </div>
    </div>
  );
};

export default Dashboard;
