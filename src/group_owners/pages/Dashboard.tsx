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
import { memo, useState, useEffect } from "react";
import { InsightData } from "@/group_owners/hooks/dashboard/types";

// Use React.memo to prevent unnecessary re-renders
const Dashboard = memo(() => {
  // State to track if there was an error
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  try {
    // Reset error state on each render attempt
    if (hasError) {
      setHasError(false);
      setErrorMessage("");
    }

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
      console.log("Stats object is not valid:", stats);
      return (
        <DashboardLayout>
          <StatsBaseSkeleton />
        </DashboardLayout>
      );
    }
    
    // התגנות מפני מבנה לא תקין של stats
    const {
      timeRange = 'last7days',
      setTimeRange = () => {},
      timeRangeLabel = '',
      
      filteredSubscribers: rawFilteredSubscribers,
      activeSubscribers: rawActiveSubscribers,
      inactiveSubscribers: rawInactiveSubscribers,
      
      totalRevenue = 0,
      avgRevenuePerSubscriber = 0,
      conversionRate = 0,
      trialUsers = { count: 0, percentage: 0 },
      miniAppUsers = { count: 0, nonSubscribers: 0 },
      paymentStats = { paymentMethods: [], paymentDistribution: [] },
      insights = {},
      insightsData: rawInsightsData,
      
      memberGrowthData: rawMemberGrowthData,
      revenueData: rawRevenueData,
      
      ownerInfo = {},
      
      isLoading
    } = stats;
    
    // וידוא שכל המערכים הם באמת מערכים
    const filteredSubscribers = Array.isArray(rawFilteredSubscribers) ? rawFilteredSubscribers : [];
    const activeSubscribers = Array.isArray(rawActiveSubscribers) ? rawActiveSubscribers : [];
    const inactiveSubscribers = Array.isArray(rawInactiveSubscribers) ? rawInactiveSubscribers : [];
    const memberGrowthData = Array.isArray(rawMemberGrowthData) ? rawMemberGrowthData : [];
    const revenueData = Array.isArray(rawRevenueData) ? rawRevenueData : [];
    
    // וידוא שיש לנו paymentStats תקין
    const safePaymentStats = {
      paymentMethods: Array.isArray(paymentStats?.paymentMethods) ? paymentStats.paymentMethods : [],
      paymentDistribution: Array.isArray(paymentStats?.paymentDistribution) ? paymentStats.paymentDistribution : []
    };
  
    // Ensure insightsData has the correct type structure
    const safeInsightsData: InsightData = {
      averageSubscriptionDuration: typeof rawInsightsData === 'object' && rawInsightsData !== null ? 
        rawInsightsData.averageSubscriptionDuration || 0 : 0,
      mostPopularPlan: typeof rawInsightsData === 'object' && rawInsightsData !== null ? 
        rawInsightsData.mostPopularPlan || 'No Plan' : 'No Plan',
      mostPopularPlanPrice: typeof rawInsightsData === 'object' && rawInsightsData !== null ? 
        rawInsightsData.mostPopularPlanPrice || 0 : 0,
      renewalRate: typeof rawInsightsData === 'object' && rawInsightsData !== null ? 
        rawInsightsData.renewalRate || 0 : 0,
      potentialRevenue: typeof rawInsightsData === 'object' && rawInsightsData !== null ? 
        rawInsightsData.potentialRevenue || 0 : 0
    };
  
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
                activeSubscribers={activeSubscribers}
                inactiveSubscribers={inactiveSubscribers}
                totalRevenue={totalRevenue}
                avgRevenuePerSubscriber={avgRevenuePerSubscriber}
                conversionRate={conversionRate}
                trialUsers={trialUsers}
                miniAppUsers={miniAppUsers}
                paymentStats={safePaymentStats}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MembersGrowthCard data={memberGrowthData} />
                <RevenueChartCard data={revenueData} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <InsightsPanel insights={safeInsightsData} />
                </div>
                <div className="lg:col-span-1">
                  <PaymentMethodsPanel
                    paymentMethods={safePaymentStats.paymentMethods}
                    paymentDistribution={safePaymentStats.paymentDistribution}
                  />
                </div>
              </div>
              
              {/* בדיקה מבטיחה שהמשתנה הוא מערך ובעל ערך משמעותי */}
              {filteredSubscribers.length === 0 && (
                <FirstTimeSetupHelp isProject={isProjectSelected} />
              )}
            </div>
          </>
        )}
      </DashboardLayout>
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Critical error in Dashboard:", error);
    
    // Set error state
    if (!hasError) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
    
    // Return fallback UI
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Dashboard Error
            </h2>
            <p className="text-gray-700 mb-4">
              We encountered an issue loading the dashboard data. Please try refreshing the page or contact support if the issue persists.
            </p>
            {errorMessage && (
              <div className="mt-2 p-2 bg-white rounded text-sm text-gray-600 font-mono">
                {errorMessage}
              </div>
            )}
          </div>
          <StatsBaseSkeleton />
        </div>
      </DashboardLayout>
    );
  }
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
