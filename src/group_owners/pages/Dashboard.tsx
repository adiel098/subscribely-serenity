import { useCommunityContext } from "@/contexts/CommunityContext";
import { useCommunityDashboardStats } from "@/group_owners/hooks/dashboard/useCommunityDashboardStats";
import { useProjectDashboardStats } from "@/group_owners/hooks/dashboard/useProjectDashboardStats";
import { DashboardHeader } from "@/group_owners/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/group_owners/components/dashboard/MetricsGrid";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import { PaymentMethodsPanel } from "@/group_owners/components/dashboard/PaymentMethodsPanel";
import { MembersGrowthCard } from "@/group_owners/components/dashboard/MembersGrowthCard";
import { RevenueChartCard } from "@/group_owners/components/dashboard/RevenueChartCard";
import { FirstTimeSetupHelp } from "@/group_owners/components/dashboard/FirstTimeSetupHelp";
import { OnboardingCompleteBanner } from "@/group_owners/components/dashboard/OnboardingCompleteBanner";
import { InsightsPanel } from "@/group_owners/components/dashboard/InsightsPanel";
import { StatsBaseSkeleton } from "@/group_owners/components/dashboard/loading/StatsBaseSkeleton";
import { memo } from "react";
import { InsightData } from "@/group_owners/hooks/dashboard/types";

// Use React.memo to prevent unnecessary re-renders
const Dashboard = memo(() => {
  const {
    selectedCommunityId,
    selectedProjectId,
    isProjectSelected
  } = useCommunityContext();
  
  // Load appropriate stats based on whether a community or project is selected
  const communityStats = useCommunityDashboardStats(isProjectSelected ? null : selectedCommunityId);
  const projectStats = useProjectDashboardStats(isProjectSelected ? selectedProjectId : null);
  
  // Use either community stats or project stats based on what's selected
  const stats = isProjectSelected ? projectStats : communityStats;
  
  // Handle a case when stats is undefined or null
  if (!stats || typeof stats !== 'object') {
    return (
      <DashboardLayout>
        <StatsBaseSkeleton />
      </DashboardLayout>
    );
  }
  
  const {
    timeRange,
    setTimeRange,
    timeRangeLabel,
    
    filteredSubscribers = [],
    activeSubscribers = [],
    inactiveSubscribers = [],
    
    totalRevenue = 0,
    avgRevenuePerSubscriber = 0,
    conversionRate = 0,
    trialUsers = { count: 0, percentage: 0 },
    miniAppUsers = { count: 0, nonSubscribers: 0 },
    paymentStats = { paymentMethods: [], paymentDistribution: [] },
    insights = {},
    insightsData = {
      averageSubscriptionDuration: 0,
      mostPopularPlan: 'No Plan',
      mostPopularPlanPrice: 0,
      renewalRate: 0,
      potentialRevenue: 0
    },
    
    memberGrowthData = [],
    revenueData = [],
    
    ownerInfo = {},
    
    isLoading
  } = stats;

  // Ensure insightsData has the correct type structure
  const safeInsightsData: InsightData = {
    averageSubscriptionDuration: typeof insightsData === 'object' && !Array.isArray(insightsData) ? 
      insightsData.averageSubscriptionDuration || 0 : 0,
    mostPopularPlan: typeof insightsData === 'object' && !Array.isArray(insightsData) ? 
      insightsData.mostPopularPlan || 'No Plan' : 'No Plan',
    mostPopularPlanPrice: typeof insightsData === 'object' && !Array.isArray(insightsData) ? 
      insightsData.mostPopularPlanPrice || 0 : 0,
    renewalRate: typeof insightsData === 'object' && !Array.isArray(insightsData) ? 
      insightsData.renewalRate || 0 : 0,
    potentialRevenue: typeof insightsData === 'object' && !Array.isArray(insightsData) ? 
      insightsData.potentialRevenue || 0 : 0
  };

  // Ensure all arrays are initialized properly
  const safeMemberGrowthData = Array.isArray(memberGrowthData) ? memberGrowthData : [];
  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
  const safePaymentMethods = Array.isArray(paymentStats?.paymentMethods) ? paymentStats.paymentMethods : [];
  const safePaymentDistribution = Array.isArray(paymentStats?.paymentDistribution) ? paymentStats.paymentDistribution : [];
  const safeFilteredSubscribers = Array.isArray(filteredSubscribers) ? filteredSubscribers : [];
  const safeActiveSubscribers = Array.isArray(activeSubscribers) ? activeSubscribers : [];
  const safeInactiveSubscribers = Array.isArray(inactiveSubscribers) ? inactiveSubscribers : [];

  return (
    <DashboardLayout>
      {isLoading ? (
        <StatsBaseSkeleton />
      ) : (
        <>
          <OnboardingCompleteBanner />
          
          <div className="space-y-6 pb-10">
            <DashboardHeader 
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              timeRangeLabel={timeRangeLabel}
              isProject={isProjectSelected}
            />
            
            <MetricsGrid 
              activeSubscribers={safeActiveSubscribers}
              inactiveSubscribers={safeInactiveSubscribers}
              totalRevenue={totalRevenue}
              avgRevenuePerSubscriber={avgRevenuePerSubscriber}
              conversionRate={conversionRate}
              trialUsers={trialUsers}
              miniAppUsers={miniAppUsers}
              paymentStats={paymentStats}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MembersGrowthCard data={safeMemberGrowthData} />
              <RevenueChartCard data={safeRevenueData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InsightsPanel insights={safeInsightsData} />
              </div>
              <div className="lg:col-span-1">
                <PaymentMethodsPanel
                  paymentMethods={safePaymentMethods}
                  paymentDistribution={safePaymentDistribution}
                />
              </div>
            </div>
            
            {/* בדיקה מבטיחה שהמשתנה הוא מערך ובעל ערך משמעותי */}
            {safeFilteredSubscribers.length === 0 && (
              <FirstTimeSetupHelp isProject={isProjectSelected} />
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
