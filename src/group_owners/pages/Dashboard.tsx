import { useProjectContext } from "@/contexts/ProjectContext";
import { useProjectDashboardStats } from "@/group_owners/hooks/dashboard/useProjectDashboardStats";
import { DashboardHeader } from "@/group_owners/components/dashboard/DashboardHeader";
import { memo, useState } from "react";
import ErrorBoundary from "@/group_owners/components/ErrorBoundary";
import { DashboardCharts } from "@/group_owners/components/dashboard/DashboardCharts";
import { MetricsGrid } from "@/group_owners/components/dashboard/MetricsGrid";
import { InsightsPanel } from "@/group_owners/components/dashboard/InsightsPanel";
import { TrialUsersStats } from "@/group_owners/components/dashboard/TrialUsersStats";
import { MiniAppUsersStats } from "@/group_owners/components/dashboard/MiniAppUsersStats";
import { PaymentMethodsPanel } from "@/group_owners/components/dashboard/PaymentMethodsPanel";

// Default empty state object to ensure consistent return shape
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
  </div>
);

// Create error UI component
const ErrorUI = ({ errorMessage }: { errorMessage: string }) => (
  <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700">
    <h3 className="text-lg font-medium mb-2">שגיאה בטעינת הנתונים</h3>
    <p className="text-sm">{errorMessage || "אירעה שגיאה לא צפויה"}</p>
    <p className="text-sm mt-2">נסה לרענן את העמוד</p>
  </div>
);

// Define interface for dashboard stats
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
  paymentStats: { paymentMethods: any[]; paymentDistribution: any[] };
  insights: any;
  insightsData: {
    averageSubscriptionDuration: number;
    mostPopularPlan: string;
    mostPopularPlanPrice: number;
    renewalRate: number;
    potentialRevenue: number;
  };
  memberGrowthData: any[];
  revenueData: any[];
  ownerInfo: any;
  isLoading: boolean;
}

// This component just displays the data, not fetching it
const DashboardContent = ({ 
  stats, 
  isLoading, 
  hasError, 
  errorMessage 
}: { 
  stats: DashboardStats; 
  isLoading: boolean; 
  hasError: boolean; 
  errorMessage: string;
}) => {
  return (
    <div className="w-full space-y-4">
      {isLoading ? (
        <StatsBaseSkeleton />
      ) : hasError ? (
        <ErrorUI errorMessage={errorMessage} />
      ) : (
        <>
          <div className="flex flex-col gap-6">
            <DashboardHeader
              subscribers={stats.filteredSubscribers || []}
              timeRange={stats.timeRange || 'last7days'}
              setTimeRange={stats.setTimeRange || (() => {})}
              timeRangeLabel={stats.timeRangeLabel || 'Last 7 Days'}
              isProject={true}
            />
            
            {/* מטריקות עיקריות */}
            <MetricsGrid 
              activeSubscribers={stats.activeSubscribers}
              inactiveSubscribers={stats.inactiveSubscribers}
              totalRevenue={stats.totalRevenue}
              avgRevenuePerSubscriber={stats.avgRevenuePerSubscriber}
              conversionRate={stats.conversionRate}
              trialUsers={stats.trialUsers}
              miniAppUsers={stats.miniAppUsers}
            />
            
            {/* גרפים */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardCharts 
                memberGrowthData={stats.memberGrowthData || []}
                revenueData={stats.revenueData || []}
                timeRange={stats.timeRange}
              />
              <InsightsPanel insights={stats.insightsData || {}} />
            </div>
            
            {/* תיבות סטטיסטיקה נוספות */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrialUsersStats 
                trialUsers={stats.trialUsers || { count: 0, percentage: 0 }} 
                averageSubscriptionDuration={stats.insightsData?.averageSubscriptionDuration || 0} 
              />
              <MiniAppUsersStats 
                miniAppUsers={stats.miniAppUsers || { count: 0, nonSubscribers: 0 }}
              />
              <PaymentMethodsPanel 
                paymentMethods={stats.paymentStats?.paymentMethods || []}
                paymentDistribution={stats.paymentStats?.paymentDistribution || []}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main Dashboard component that fetches data and passes it to DashboardContent
const Dashboard = memo(() => {
  console.log("🔄 Dashboard component rendering");
  
  // State for tracking loading, errors and stats - ALWAYS DECLARE ALL HOOKS FIRST
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get project context - this is a hook call
  const { selectedProjectId } = useProjectContext();
  
  // Get dashboard stats directly from the hook - this is a hook call
  const stats = useProjectDashboardStats(selectedProjectId);
  
  // IMPORTANT: React rule - all hooks must be called on every render
  // React won't allow conditional hook calls or early returns before hooks
  
  // Move all the logic here, after ALL hooks have been called
  let displayStats = DEFAULT_STATS;
  let displayLoading = true;
  
  // Logic that WAS inside the if statement, now outside after all hooks
  if (stats) {
    displayStats = stats;
    if (isLoading) {
      setIsLoading(false);
    }
    displayLoading = isLoading && stats.isLoading;
  }
  
  console.log("📊 Dashboard render with stats:", {
    hasStats: Boolean(stats),
    isLoading,
    displayLoading
  });
  
  // Render the content component with our data
  return (
    <ErrorBoundary>
      <DashboardContent 
        stats={displayStats}
        isLoading={displayLoading}
        hasError={hasError}
        errorMessage={errorMessage}
      />
    </ErrorBoundary>
  );
});

Dashboard.displayName = 'Dashboard';
export default Dashboard;
