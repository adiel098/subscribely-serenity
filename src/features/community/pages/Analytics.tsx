
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { useAnalytics } from "@/features/community/hooks/useAnalytics";
import { useBotStats } from "@/features/community/hooks/useBotStats";
import { useSubscribers } from "@/features/community/hooks/useSubscribers";
import { NextCheckTimer } from "@/features/community/components/analytics/NextCheckTimer";
import { StatsGrid } from "@/features/community/components/analytics/StatsGrid";
import { ActivityChart } from "@/features/community/components/analytics/ActivityChart";
import { ActivityLog } from "@/features/community/components/analytics/ActivityLog";
import type { ChartData } from "@/types";

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
    totalMembers: botStats?.totalMembers || 0,
    totalEvents: events?.length || 0,
    notifications: events?.filter(e => e.event_type === 'notification_sent').length || 0
  };

  // Transform events data for the chart
  const chartData: ChartData[] = (events || []).map(event => ({
    date: new Date(event.created_at).toLocaleDateString(),
    events: 1,
    revenue: event.event_type === 'payment_received' ? (event.amount || 0) : 0
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <NextCheckTimer />
      <StatsGrid {...stats} />
      <ActivityChart data={chartData} />
      <ActivityLog events={events || []} />
    </div>
  );
};

export default Analytics;
