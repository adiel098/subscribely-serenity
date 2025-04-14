import { useQuery } from "@tanstack/react-query";
import { useProjectContext } from "@/contexts/ProjectContext";
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
  // Get context data outside of try/catch to prevent hooks conditional execution
  const projectContext = useProjectContext();
  const { selectedProjectId } = projectContext;
  
  console.log("🚀 Dashboard - render start with projectId:", selectedProjectId);
  
  // Fetch appropriate stats based on selection - outside of try/catch
  // Wrap the hook with try/catch to protect against errors
  let projectStats;
  try {
    console.log("🔄 Dashboard - calling useProjectDashboardStats with projectId:", selectedProjectId);
    projectStats = useProjectDashboardStats(selectedProjectId);
    console.log("✅ Dashboard - projectStats loaded successfully:", 
      Boolean(projectStats), 
      "isObject:", typeof projectStats === 'object',
      "hasProperties:", projectStats ? Object.keys(projectStats).length : 0
    );
  } catch (error) {
    console.error("❌ Dashboard - Error loading project stats:", error);
    projectStats = DEFAULT_STATS;
  }
  
  // Add default safe state for dashboard stats
  const [safeStats, setSafeStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [timeRange, setTimeRange] = useState<string>('last7days');
  const [timeRangeLabel, setTimeRangeLabel] = useState<string>('Last 7 Days');
  const [filteredSubscribers, setFilteredSubscribers] = useState<any[]>([]);
  const [activeSubscribers, setActiveSubscribers] = useState<any[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Log what we have in our state
  console.log("🧩 Dashboard - state initialized:", { 
    hasError, 
    errorMessage, 
    isDataLoading,
    timeRange,
    timeRangeLabel,
    filteredSubscribersLength: filteredSubscribers.length,
    activeSubscribersLength: activeSubscribers.length
  });
  
  // Reset error state when component mounts or re-renders
  useEffect(() => {
    if (hasError) {
      setHasError(false);
      setErrorMessage("");
    }
  }, [hasError]);

  // Process stats data in a separate useEffect
  useEffect(() => {
    console.log("🔄 Dashboard - useEffect for stats processing starting");
    try {
      // Use projectStats directly since we're only dealing with projects
      const rawStats = projectStats || DEFAULT_STATS;
      
      console.log("📊 Dashboard - processing stats:", { 
        projectStats: Boolean(projectStats), 
        rawStats: Boolean(rawStats), 
        rawStatsType: typeof rawStats,
        hasProjectStatsKeys: projectStats ? Object.keys(projectStats).length : 0,
        hasRawStatsKeys: rawStats ? Object.keys(rawStats).length : 0
      });
      
      // Handle a case when stats is undefined or null
      if (!rawStats || typeof rawStats !== 'object') {
        console.log("❌ Dashboard - Stats object is not valid:", rawStats);
        setSafeStats(DEFAULT_STATS);
        setIsDataLoading(false);
        return;
      }
      
      // Detailed logging for all important parts of the stats object
      console.log("🔍 Dashboard - Checking individual stats properties:", {
        hasTimeRange: Boolean(rawStats.timeRange),
        hasSetTimeRange: typeof rawStats.setTimeRange === 'function',
        hasTimeRangeLabel: Boolean(rawStats.timeRangeLabel),
        
        // Arrays - important to check array types and lengths
        filteredSubscribers: {
          exists: Boolean(rawStats.filteredSubscribers),
          isArray: Array.isArray(rawStats.filteredSubscribers),
          length: Array.isArray(rawStats.filteredSubscribers) ? rawStats.filteredSubscribers.length : 'not an array'
        },
        activeSubscribers: {
          exists: Boolean(rawStats.activeSubscribers),
          isArray: Array.isArray(rawStats.activeSubscribers),
          length: Array.isArray(rawStats.activeSubscribers) ? rawStats.activeSubscribers.length : 'not an array'
        },
        inactiveSubscribers: {
          exists: Boolean(rawStats.inactiveSubscribers),
          isArray: Array.isArray(rawStats.inactiveSubscribers),
          length: Array.isArray(rawStats.inactiveSubscribers) ? rawStats.inactiveSubscribers.length : 'not an array'
        },
        
        // More complex objects
        paymentStats: {
          exists: Boolean(rawStats.paymentStats),
          isObject: typeof rawStats.paymentStats === 'object',
          hasPaymentMethods: rawStats.paymentStats && Boolean(rawStats.paymentStats.paymentMethods),
          paymentMethodsIsArray: rawStats.paymentStats && Array.isArray(rawStats.paymentStats.paymentMethods),
          paymentMethodsLength: rawStats.paymentStats && Array.isArray(rawStats.paymentStats.paymentMethods) 
            ? rawStats.paymentStats.paymentMethods.length : 'not available'
        },
        
        // Chart data
        chartData: {
          hasMemberGrowthData: Boolean(rawStats.memberGrowthData),
          memberGrowthDataIsArray: Array.isArray(rawStats.memberGrowthData),
          memberGrowthDataLength: Array.isArray(rawStats.memberGrowthData) ? rawStats.memberGrowthData.length : 'not an array',
          
          hasRevenueData: Boolean(rawStats.revenueData),
          revenueDataIsArray: Array.isArray(rawStats.revenueData),
          revenueDataLength: Array.isArray(rawStats.revenueData) ? rawStats.revenueData.length : 'not an array'
        }
      });
      
      // Ensure arrays are actually arrays
      const filteredSubscribers = Array.isArray(rawStats.filteredSubscribers) ? rawStats.filteredSubscribers : [];
      const activeSubscribers = Array.isArray(rawStats.activeSubscribers) ? rawStats.activeSubscribers : [];
      const inactiveSubscribers = Array.isArray(rawStats.inactiveSubscribers) ? rawStats.inactiveSubscribers : [];
      const memberGrowthData = Array.isArray(rawStats.memberGrowthData) ? rawStats.memberGrowthData : [];
      const revenueData = Array.isArray(rawStats.revenueData) ? rawStats.revenueData : [];
      
      // Ensure payment stats are valid
      const safePaymentStats = {
        paymentMethods: Array.isArray(rawStats.paymentStats?.paymentMethods) ? rawStats.paymentStats.paymentMethods : [],
        paymentDistribution: Array.isArray(rawStats.paymentStats?.paymentDistribution) ? rawStats.paymentStats.paymentDistribution : []
      };
    
      // Ensure insightsData has the correct type structure
      const safeInsightsData = {
        averageSubscriptionDuration: typeof rawStats.insightsData === 'object' && rawStats.insightsData !== null ? 
          rawStats.insightsData.averageSubscriptionDuration || 0 : 0,
        mostPopularPlan: typeof rawStats.insightsData === 'object' && rawStats.insightsData !== null ? 
          rawStats.insightsData.mostPopularPlan || 'No Plan' : 'No Plan',
        mostPopularPlanPrice: typeof rawStats.insightsData === 'object' && rawStats.insightsData !== null ? 
          rawStats.insightsData.mostPopularPlanPrice || 0 : 0,
        renewalRate: typeof rawStats.insightsData === 'object' && rawStats.insightsData !== null ? 
          rawStats.insightsData.renewalRate || 0 : 0,
        potentialRevenue: typeof rawStats.insightsData === 'object' && rawStats.insightsData !== null ? 
          rawStats.insightsData.potentialRevenue || 0 : 0
      };

      // Create safe processed stats
      const processedStats: DashboardStats = {
        timeRange: rawStats.timeRange,
        setTimeRange: rawStats.setTimeRange,
        timeRangeLabel: rawStats.timeRangeLabel,
        
        filteredSubscribers,
        activeSubscribers,
        inactiveSubscribers,
        
        totalRevenue: rawStats.totalRevenue,
        avgRevenuePerSubscriber: rawStats.avgRevenuePerSubscriber,
        conversionRate: rawStats.conversionRate,
        trialUsers: rawStats.trialUsers,
        miniAppUsers: rawStats.miniAppUsers,
        paymentStats: safePaymentStats,
        insights: rawStats.insights,
        insightsData: safeInsightsData,
        
        memberGrowthData,
        revenueData,
        
        ownerInfo: rawStats.ownerInfo,
        
        isLoading: rawStats.isLoading
      };
      
      // Update state with safe stats
      setSafeStats({
        timeRange: rawStats.timeRange,
        setTimeRange: rawStats.setTimeRange,
        timeRangeLabel: rawStats.timeRangeLabel,
        filteredSubscribers,
        activeSubscribers,
        inactiveSubscribers,
        totalRevenue: rawStats.totalRevenue,
        avgRevenuePerSubscriber: rawStats.avgRevenuePerSubscriber,
        conversionRate: rawStats.conversionRate,
        trialUsers: rawStats.trialUsers,
        miniAppUsers: rawStats.miniAppUsers,
        paymentStats,
        insights: rawStats.insights,
        insightsData,
        memberGrowthData,
        revenueData,
        ownerInfo: rawStats.ownerInfo,
        isLoading: false
      });
      
      // Update state variables directly used in the UI
      setTimeRange(rawStats.timeRange);
      setTimeRangeLabel(rawStats.timeRangeLabel);
      setFilteredSubscribers(filteredSubscribers);
      setActiveSubscribers(activeSubscribers);
      
      // Finish loading
      setIsDataLoading(false);
    } catch (error) {
      console.error("Error processing stats:", error);
      setSafeStats(DEFAULT_STATS);
      setIsDataLoading(false);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error processing stats");
    }
  }, [projectStats]);
  
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
        <div className="w-full space-y-4">
          {isDataLoading ? (
            <StatsBaseSkeleton />
          ) : hasError ? (
            <ErrorUI errorMessage={errorMessage} />
          ) : (
            <>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <DashboardHeader
                    subscribers={filteredSubscribers}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    timeRangeLabel={timeRangeLabel}
                    isProject={true}
                  />
                </div>
              </div>
            </>
          )}
        </div>
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
