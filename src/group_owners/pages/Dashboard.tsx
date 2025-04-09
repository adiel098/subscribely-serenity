
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useCommunityDashboardStats } from "@/group_owners/hooks/dashboard/useCommunityDashboardStats";
import { useProjectDashboardStats } from "@/group_owners/hooks/dashboard/useProjectDashboardStats";
import { DashboardHeader } from "@/group_owners/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/group_owners/components/dashboard/MetricsGrid";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PaymentMethodsPanel } from "@/group_owners/components/dashboard/PaymentMethodsPanel";
import { MembersGrowthCard } from "@/group_owners/components/dashboard/MembersGrowthCard";
import { RevenueChartCard } from "@/group_owners/components/dashboard/RevenueChartCard";
import { FirstTimeSetupHelp } from "@/group_owners/components/dashboard/FirstTimeSetupHelp";
import { OnboardingCompleteBanner } from "@/group_owners/components/dashboard/OnboardingCompleteBanner";
import { InsightsPanel } from "@/group_owners/components/dashboard/InsightsPanel";
import { StatsBaseSkeleton } from "@/group_owners/components/dashboard/loading/StatsBaseSkeleton";

const Dashboard = () => {
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
              paymentStats={paymentStats}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MembersGrowthCard data={memberGrowthData} />
              <RevenueChartCard data={revenueData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <InsightsPanel insights={insights} />
              </div>
              <div className="lg:col-span-1">
                <PaymentMethodsPanel
                  paymentMethods={paymentStats.paymentMethods}
                  paymentDistribution={paymentStats.paymentDistribution}
                />
              </div>
            </div>
            
            {filteredSubscribers && filteredSubscribers.length === 0 && (
              <FirstTimeSetupHelp isProject={isProjectSelected} />
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
