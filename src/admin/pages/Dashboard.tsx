
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStatistics } from "@/admin/hooks/useAdminStatistics";
import { DashboardHeader } from "@/admin/components/dashboard/DashboardHeader";
import { StatisticsGrid } from "@/admin/components/dashboard/StatisticsGrid";
import { RevenueOverviewCard } from "@/admin/components/dashboard/RevenueOverviewCard";
import { RecentActivityCard } from "@/admin/components/dashboard/RecentActivityCard";
import { AnalyticsTabContent } from "@/admin/components/dashboard/AnalyticsTabContent";
import { ReportsTabContent } from "@/admin/components/dashboard/ReportsTabContent";
import { formatCurrency } from "@/admin/components/dashboard/formatters";

export default function AdminDashboard() {
  const { data: statistics, isLoading, error } = useAdminStatistics();

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-background/90 backdrop-blur-sm border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatisticsGrid 
            statistics={statistics} 
            isLoading={isLoading} 
            error={error} 
            formatCurrency={formatCurrency} 
          />
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <RevenueOverviewCard />
            <RecentActivityCard />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTabContent />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <ReportsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
