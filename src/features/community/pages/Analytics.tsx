
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { useAnalytics } from "@/hooks/community/useAnalytics";
import { useBotStats } from "@/hooks/community/useBotStats";
import { useSubscribers } from "@/hooks/community/useSubscribers";
import { format } from "date-fns";
import { NextCheckTimer } from "@/components/analytics/NextCheckTimer";
import { StatsGrid } from "@/components/analytics/StatsGrid";
import { ActivityChart } from "@/components/analytics/ActivityChart";
import { ActivityLog } from "@/components/analytics/ActivityLog";

const Analytics = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: events } = useAnalytics(selectedCommunityId || "");
  const { data: botStats } = useBotStats(selectedCommunityId || "");
  const { data: subscribers } = useSubscribers(selectedCommunityId || "");

  // Calculate statistics
  const stats = {
    totalRevenue: events?.reduce((sum, event) => 
      event.event_type === 'payment_received' ? (sum + (event.amount || 0)) : sum, 0
    ) || 0,
    activeSubscribers: subscribers?.filter(s => s.subscription_status).length || 0,
    notifications: botStats?.messagesSent || 0,
    totalMembers: botStats?.totalMembers || 0
  };

  // Chart data
  const chartData = events?.reduce((acc: any[], event) => {
    const date = format(new Date(event.created_at), 'MM/dd');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.events += 1;
      if (event.event_type === 'payment_received') {
        existing.revenue += event.amount || 0;
      }
    } else {
      acc.push({
        date,
        events: 1,
        revenue: event.event_type === 'payment_received' ? (event.amount || 0) : 0
      });
    }
    
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <NextCheckTimer />
      <StatsGrid 
        totalRevenue={stats.totalRevenue}
        activeSubscribers={stats.activeSubscribers}
        notifications={stats.notifications}
        totalMembers={stats.totalMembers}
        totalEvents={events?.length || 0}
      />
      <ActivityChart data={chartData} />
      <ActivityLog events={events || []} />
    </div>
  );
};

export default Analytics;
