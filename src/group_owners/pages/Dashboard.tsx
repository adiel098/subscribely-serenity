
import React, { useEffect } from "react";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { DashboardStats } from "@/group_owners/components/dashboard/DashboardStats";
import { TimeFilter } from "@/group_owners/components/dashboard/TimeFilter";
import { DashboardCharts } from "@/group_owners/components/dashboard/DashboardCharts";
import { TrialUsersStats } from "@/group_owners/components/dashboard/TrialUsersStats";
import { MiniAppUsersStats } from "@/group_owners/components/dashboard/MiniAppUsersStats";
import { PaymentStatus } from "@/group_owners/components/dashboard/PaymentStatus";
import { AnalyticsOverview } from "@/group_owners/components/dashboard/AnalyticsOverview";
import { PaymentAnalytics } from "@/group_owners/components/dashboard/PaymentAnalytics";
import { useDashboardStats } from "@/group_owners/hooks/dashboard/useDashboardStats";
import { useGroupDashboardStats } from "@/group_owners/hooks/dashboard/useGroupDashboardStats";
import { Loader2, FolderKanban } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const {
    selectedCommunityId,
    selectedGroupId,
    isGroupSelected
  } = useCommunityContext();
  
  const isMobile = useIsMobile();

  // Use the appropriate hook based on whether a community or group is selected
  const communityStats = useDashboardStats(selectedCommunityId || "");
  const groupStats = useGroupDashboardStats(selectedGroupId);

  // Use the correct stats based on what's selected
  const stats = isGroupSelected ? groupStats : communityStats;
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
  } = stats;

  // Get the owner's first name or use a fallback
  const ownerFirstName = ownerInfo?.first_name || 'there';
  
  useEffect(() => {
    console.log("🔍 Dashboard loaded with community ID:", selectedCommunityId);
    console.log("🔍 Dashboard loaded with group ID:", selectedGroupId);
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
  }, [selectedCommunityId, selectedGroupId, ownerInfo, filteredSubscribers, activeSubscribers, inactiveSubscribers, totalRevenue, ownerFirstName]);
  
  if (isLoading) {
    console.log("⏳ Dashboard is loading...");
    return <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>;
  }
  
  return (
    <div className={`space-y-4 pb-6 ${isMobile ? 'px-3 py-1' : 'px-[37px] py-[28px]'}`}>
      <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-4">
        <div>
          <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-800 flex items-center gap-2`}>
            Hello 👋 {ownerFirstName}
            {isGroupSelected && <span className="inline-flex items-center text-xs bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md ml-1.5">
                <FolderKanban className="h-3 w-3 mr-0.5" />
                Group View
              </span>}
          </h1>
          <p className={`text-gray-600 mt-0.5 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isGroupSelected ? "Overview of your community group's performance" : "Overview of your community's performance"}
          </p>
        </div>
        <TimeFilter timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {isMobile ? (
              // Mobile layout - 2 items per row
              <>
                <div className="col-span-1">
                  <TrialUsersStats trialUsers={trialUsers} averageSubscriptionDuration={insights.averageSubscriptionDuration} />
                </div>
                <div className="col-span-1">
                  <MiniAppUsersStats miniAppUsers={miniAppUsers} />
                </div>
                <div className="col-span-2">
                  <DashboardStats 
                    totalSubscribers={filteredSubscribers.length} 
                    activeSubscribers={activeSubscribers.length} 
                    inactiveSubscribers={inactiveSubscribers.length} 
                    totalRevenue={totalRevenue} 
                    avgRevenuePerSubscriber={avgRevenuePerSubscriber} 
                    conversionRate={conversionRate} 
                    timeRange={timeRangeLabel} 
                    isMobile={isMobile}
                  />
                </div>
              </>
            ) : (
              // Desktop layout
              <>
                <div className="md:col-span-1">
                  <TrialUsersStats trialUsers={trialUsers} averageSubscriptionDuration={insights.averageSubscriptionDuration} />
                </div>
                <div className="md:col-span-1">
                  <MiniAppUsersStats miniAppUsers={miniAppUsers} />
                </div>
                <div className="md:col-span-4">
                  <DashboardStats 
                    totalSubscribers={filteredSubscribers.length} 
                    activeSubscribers={activeSubscribers.length} 
                    inactiveSubscribers={inactiveSubscribers.length} 
                    totalRevenue={totalRevenue} 
                    avgRevenuePerSubscriber={avgRevenuePerSubscriber} 
                    conversionRate={conversionRate} 
                    timeRange={timeRangeLabel} 
                    isMobile={isMobile}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`flex flex-col lg:flex-row gap-3 mt-4`}>
        <div className={`w-full ${isMobile ? '' : 'lg:w-[65%]'}`}>
          <DashboardCharts memberGrowthData={memberGrowthData} revenueData={revenueData} timeRange={timeRangeLabel} />
        </div>
        
        <div className={`w-full ${isMobile ? '' : 'lg:w-[32%]'} flex flex-col gap-3`}>
          <div className="grid grid-cols-2 gap-3">
            <PaymentAnalytics paymentStats={paymentStats} />
            <AnalyticsOverview 
              averageSubscriptionDuration={insights.averageSubscriptionDuration} 
              mostPopularPlan={insights.mostPopularPlan} 
              mostPopularPlanPrice={insights.mostPopularPlanPrice} 
              mostActiveDay={insights.mostActiveDay} 
              renewalRate={insights.renewalRate} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
