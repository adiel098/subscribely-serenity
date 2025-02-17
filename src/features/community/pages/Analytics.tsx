import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { useAnalytics } from "@/hooks/community/useAnalytics";
import { useBotStats } from "@/hooks/community/useBotStats";
import { useSubscribers } from "@/hooks/community/useSubscribers";
import { NextCheckTimer } from "../components/analytics/NextCheckTimer";
import { StatsGrid } from "../components/analytics/StatsGrid";
import { ActivityChart } from "../components/analytics/ActivityChart";
import { ActivityLog } from "../components/analytics/ActivityLog";

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
    totalEvents: events?.length || 0
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>
      <NextCheckTimer />
      <StatsGrid {...stats} />
      <ActivityChart data={events || []} />
      <ActivityLog events={events || []} />
    </div>
  );
};

export default Analytics;
