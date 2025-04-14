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
import { memo, useState, useEffect } from "react";
import { InsightData } from "@/group_owners/hooks/dashboard/types";

// Type for stats state to ensure consistent shape
interface DashboardStats {
  timeRange: string;
  setTimeRange: (value: string) => void;
  timeRangeLabel: string;
  filteredSubscribers: any[];
  activeSubscribers: any[];
  inactiveSubscribers: any[];
  totalRevenue: number;
  avgRevenuePerSubscriber: number;
  conversionRate: number;
  trialUsers: { count: number; percentage: number };
  miniAppUsers: { count: number; nonSubscribers: number };
  paymentStats: { 
    paymentMethods: any[]; 
    paymentDistribution: any[] 
  };
  insights: any;
  insightsData: InsightData;
  memberGrowthData: any[];
  revenueData: any[];
  ownerInfo: any;
  isLoading: boolean;
}

// Default empty stats to avoid undefined errors
const DEFAULT_STATS: DashboardStats = {
  timeRange: 'last7days',
  setTimeRange: (value: string) => {},
  timeRangeLabel: '',
  filteredSubscribers: [],
  activeSubscribers: [],
  inactiveSubscribers: [],
  totalRevenue: 0,
  avgRevenuePerSubscriber: 0,
  conversionRate: 0,
  trialUsers: { count: 0, percentage: 0 },
  miniAppUsers: { count: 0, nonSubscribers: 0 },
  paymentStats: { paymentMethods: [], paymentDistribution: [] },
  insights: {},
  insightsData: {
    averageSubscriptionDuration: 0,
    mostPopularPlan: 'No Plan',
    mostPopularPlanPrice: 0,
    renewalRate: 0,
    potentialRevenue: 0
  },
  memberGrowthData: [],
  revenueData: [],
  ownerInfo: {},
  isLoading: false
};

// Create dummy component for loading state
const StatsBaseSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-80 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-80 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
);

// Define the error UI component
const ErrorUI = ({ message }: { message: string }) => (
  <div className="p-8">
    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-semibold text-red-700 mb-2">
        Dashboard Error
      </h2>
      <p className="text-gray-700 mb-4">
        We encountered an issue loading the dashboard data. Please try refreshing the page or contact support if the issue persists.
      </p>
      {message && (
        <div className="mt-2 p-2 bg-white rounded text-sm text-gray-600 font-mono">
          {message}
        </div>
      )}
    </div>
    <StatsBaseSkeleton />
  </div>
);

// Use React.memo to prevent unnecessary re-renders
const Dashboard = memo(() => {
  // State to track if there was an error
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // State to store processed stats safely
  const [safeStats, setSafeStats] = useState<DashboardStats>(DEFAULT_STATS);
  // State to track if data is loading
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Get context data outside of try/catch to prevent hooks conditional execution
  const communityContext = useCommunityContext();
  const { selectedCommunityId, selectedProjectId, isProjectSelected } = communityContext;
  
  // Fetch appropriate stats based on selection - outside of try/catch
  const communityStats = useCommunityDashboardStats(isProjectSelected ? null : selectedCommunityId);
  const projectStats = useProjectDashboardStats(isProjectSelected ? selectedProjectId : null);

  // Reset error state when component mounts or re-renders
  useEffect(() => {
    if (hasError) {
      setHasError(false);
      setErrorMessage("");
    }
  }, [hasError]);

  // Process stats data in a separate useEffect
  useEffect(() => {
    try {
      // Use either community stats or project stats based on what's selected
      const rawStats = isProjectSelected ? projectStats : communityStats;
      
      // Handle a case when stats is undefined or null
      if (!rawStats || typeof rawStats !== 'object') {
        console.log("Stats object is not valid:", rawStats);
        setSafeStats(DEFAULT_STATS);
        setIsDataLoading(false);
        return;
      }
      
      // Process and sanitize stats data
      const {
        timeRange = 'last7days',
        setTimeRange = (value: string) => {},
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
      } = rawStats;
      
      // Ensure arrays are actually arrays
      const filteredSubscribers = Array.isArray(rawFilteredSubscribers) ? rawFilteredSubscribers : [];
      const activeSubscribers = Array.isArray(rawActiveSubscribers) ? rawActiveSubscribers : [];
      const inactiveSubscribers = Array.isArray(rawInactiveSubscribers) ? rawInactiveSubscribers : [];
      const memberGrowthData = Array.isArray(rawMemberGrowthData) ? rawMemberGrowthData : [];
      const revenueData = Array.isArray(rawRevenueData) ? rawRevenueData : [];
      
      // Ensure payment stats are valid
      const safePaymentStats = {
        paymentMethods: Array.isArray(paymentStats?.paymentMethods) ? paymentStats.paymentMethods : [],
        paymentDistribution: Array.isArray(paymentStats?.paymentDistribution) ? paymentStats.paymentDistribution : []
      };
    
      // Ensure insightsData has the correct type structure
      const safeInsightsData = {
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

      // Create safe processed stats
      const processedStats: DashboardStats = {
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
        paymentStats: safePaymentStats,
        insights,
        insightsData: safeInsightsData,
        
        memberGrowthData,
        revenueData,
        
        ownerInfo,
        
        isLoading
      };
      
      // Update state with safe stats
      setSafeStats(processedStats);
      setIsDataLoading(isLoading);
    } catch (error) {
      console.error("Error processing stats:", error);
      setSafeStats(DEFAULT_STATS);
      setIsDataLoading(false);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error processing stats");
    }
  }, [communityStats, projectStats, isProjectSelected]);
  
  // Handle critical errors at the component level
  try {
    // Destructure from safe stats state for rendering
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
      insightsData,
      memberGrowthData,
      revenueData,
      isLoading
    } = safeStats;
  
    // If we have an error, show the error UI
    if (hasError) {
      return (
        <DashboardLayout>
          <ErrorUI message={errorMessage} />
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout>
        {isDataLoading ? (
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
                  <InsightsPanel insights={insightsData} />
                </div>
                <div className="lg:col-span-1">
                  <PaymentMethodsPanel
                    paymentMethods={paymentStats.paymentMethods}
                    paymentDistribution={paymentStats.paymentDistribution}
                  />
                </div>
              </div>
              
              {Array.isArray(filteredSubscribers) && filteredSubscribers.length === 0 && (
                <FirstTimeSetupHelp isProject={isProjectSelected} />
              )}
            </div>
          </>
        )}
      </DashboardLayout>
    );
  } catch (error) {
    // Log the error for debugging
    console.error("Critical error in Dashboard render:", error);
    
    // Set error state if not already set
    if (!hasError) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
    
    // Return fallback UI
    return (
      <DashboardLayout>
        <ErrorUI message={errorMessage || "Unexpected rendering error"} />
      </DashboardLayout>
    );
  }
});

Dashboard.displayName = "Dashboard";

export default Dashboard;
