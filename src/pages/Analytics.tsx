
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, addMinutes, differenceInMinutes } from "date-fns";
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

  // חישוב הזמן עד הבדיקה הבאה (כל שעה)
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

  // עדכון הספירה לאחור
  useEffect(() => {
    if (!nextCronTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const diff = differenceInMinutes(nextCronTime, now);
      const minutes = diff % 60;
      setTimeUntilNextCron(`${minutes} דקות`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [nextCronTime]);

  // חישוב נתונים סטטיסטיים
  const stats = {
    totalRevenue: events?.reduce((sum, event) => 
      event.event_type === 'payment_received' ? (sum + (event.amount || 0)) : sum, 0
    ) || 0,
    activeSubscribers: subscribers?.filter(s => s.subscription_status).length || 0,
    notifications: events?.filter(e => e.event_type === 'notification_sent').length || 0,
    totalMembers: botStats?.totalMembers || 0
  };

  // נתונים לגרף
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
      <h1 className="text-2xl font-bold">אנליטיקס</h1>

      {/* Next Cron Timer */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-none">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Timer className="h-8 w-8 text-purple-500" />
            <div>
              <h3 className="text-lg font-semibold">בדיקת מנויים הבאה</h3>
              <p className="text-sm text-gray-500">
                {nextCronTime ? (
                  <>
                    בעוד {timeUntilNextCron} ({format(nextCronTime, 'HH:mm')})
                  </>
                ) : (
                  'טוען...'
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
            <CardTitle className="text-sm font-medium">סה"כ הכנסות</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <div className="text-xs text-gray-500">מכל הזמנים</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">מנויים פעילים</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
            <div className="text-xs text-gray-500">
              מתוך {stats.totalMembers} חברים
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">התראות שנשלחו</CardTitle>
            <Bell className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications}</div>
            <div className="text-xs text-gray-500">ב-30 הימים האחרונים</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">פעילות</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
            <div className="text-xs text-gray-500">אירועים נרשמו</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>פעילות ורווחים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="events" fill="#4f46e5" name="פעולות" />
                <Bar yAxisId="right" dataKey="revenue" fill="#22c55e" name="הכנסות" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>יומן פעילות</CardTitle>
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
                    {event.event_type === 'payment_received' && 'תשלום התקבל'}
                    {event.event_type === 'subscription_expired' && 'מנוי הסתיים'}
                    {event.event_type === 'notification_sent' && 'התראה נשלחה'}
                    {event.event_type === 'member_joined' && 'חבר חדש הצטרף'}
                    {event.event_type === 'subscription_renewed' && 'מנוי חודש'}
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
