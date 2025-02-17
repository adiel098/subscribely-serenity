
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, addMinutes, differenceInSeconds } from "date-fns";
import { useCommunityContext } from "@/contexts/CommunityContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBotStats } from "@/hooks/useBotStats";
import { useSubscribers } from "@/hooks/useSubscribers";
import {
  Activity,
  Users,
  CreditCard,
  Bell,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Timer
} from "lucide-react";

const Analytics = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: events } = useAnalytics(selectedCommunityId || "");
  const { data: botStats } = useBotStats(selectedCommunityId || "");
  const { data: subscribers } = useSubscribers(selectedCommunityId || "");
  const [nextCronTime, setNextCronTime] = useState<Date | null>(null);
  const [timeUntilNextCron, setTimeUntilNextCron] = useState<string>("");

  // Calculate time until next check (hourly)
  useEffect(() => {
    const calculateNextCron = () => {
      const now = new Date();
      const next = addMinutes(now, 60 - now.getMinutes());
      next.setSeconds(0);
      next.setMilliseconds(0);
      setNextCronTime(next);
    };

    calculateNextCron();
    const interval = setInterval(calculateNextCron, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown
  useEffect(() => {
    if (!nextCronTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const diffInSeconds = differenceInSeconds(nextCronTime, now);
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      setTimeUntilNextCron(`${minutes} minutes ${seconds} seconds`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextCronTime]);

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

      {/* Next Cron Timer */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-none">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Timer className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">Next Subscription Check</h3>
              <p className="text-sm text-gray-500">
                {nextCronTime ? (
                  <>
                    in {timeUntilNextCron} ({format(nextCronTime, 'HH:mm:ss')})
                  </>
                ) : (
                  'Loading...'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <div className="text-xs text-gray-500">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
            <div className="text-xs text-gray-500">
              out of {stats.totalMembers} members
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications}</div>
            <div className="text-xs text-gray-500">via bot</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
            <div className="text-xs text-gray-500">events recorded</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity and Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="events" fill="#4f46e5" name="Events" />
                <Bar yAxisId="right" dataKey="revenue" fill="#22c55e" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events?.slice(0, 10).map(event => (
              <div key={event.id} className="flex items-center space-x-4">
                <div className="p-2 rounded-full bg-gray-100">
                  {event.event_type === 'payment_received' && <CreditCard className="h-4 w-4 text-green-500" />}
                  {event.event_type === 'subscription_expired' && <Clock className="h-4 w-4 text-red-500" />}
                  {event.event_type === 'notification_sent' && <Bell className="h-4 w-4 text-yellow-500" />}
                  {event.event_type === 'member_joined' && <Users className="h-4 w-4 text-blue-500" />}
                  {event.event_type === 'subscription_renewed' && <TrendingUp className="h-4 w-4 text-purple-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {event.event_type === 'payment_received' && 'Payment Received'}
                    {event.event_type === 'subscription_expired' && 'Subscription Expired'}
                    {event.event_type === 'notification_sent' && 'Notification Sent'}
                    {event.event_type === 'member_joined' && 'New Member Joined'}
                    {event.event_type === 'subscription_renewed' && 'Subscription Renewed'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                {event.amount && (
                  <div className="text-green-500 font-medium">${event.amount}</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
