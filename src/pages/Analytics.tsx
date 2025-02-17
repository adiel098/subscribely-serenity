
import { DashboardLayout } from "@/components/DashboardLayout";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ActivityLog } from "@/components/analytics/ActivityLog";
import { StatsGrid } from "@/components/analytics/StatsGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Analytics = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Fetch analytics events
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;

      // Fetch platform statistics
      const { data: communities, error: communitiesError } = await supabase
        .from('communities')
        .select('member_count, subscription_count, subscription_revenue');

      if (communitiesError) throw communitiesError;

      // Calculate totals
      const totalMembers = communities.reduce((sum, c) => sum + (c.member_count || 0), 0);
      const totalSubscribers = communities.reduce((sum, c) => sum + (c.subscription_count || 0), 0);
      const totalRevenue = communities.reduce((sum, c) => sum + (c.subscription_revenue || 0), 0);

      // Prepare chart data
      const chartData = events.reduce((acc: any[], event) => {
        const date = new Date(event.created_at).toLocaleDateString();
        const existingDate = acc.find(item => item.date === date);
        
        if (existingDate) {
          existingDate.events += 1;
          existingDate.revenue += event.amount || 0;
        } else {
          acc.push({
            date,
            events: 1,
            revenue: event.amount || 0
          });
        }
        
        return acc;
      }, []);

      return {
        events,
        totalMembers,
        totalSubscribers,
        totalRevenue,
        totalEvents: events.length,
        chartData: chartData.slice(-30) // Last 30 days
      };
    }
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
          <p className="text-muted-foreground">
            Overview of your platform's performance and activity
          </p>
        </div>

        <StatsGrid
          totalMembers={analyticsData.totalMembers}
          activeSubscribers={analyticsData.totalSubscribers}
          notifications={analyticsData.events.filter(e => e.event_type === 'notification_sent').length}
          totalRevenue={analyticsData.totalRevenue}
          totalEvents={analyticsData.totalEvents}
        />

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <ActivityChart data={analyticsData.chartData} />
          <ActivityLog events={analyticsData.events} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
