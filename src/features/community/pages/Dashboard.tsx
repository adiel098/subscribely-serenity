import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, Users, MessageSquare, CheckCircle2 } from "lucide-react";
import { useCommunityContext } from "@/features/community/providers/CommunityContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { format } from "date-fns";

const Dashboard = () => {
  const { selectedCommunityId } = useCommunityContext();
  const { data: events } = useAnalytics(selectedCommunityId || "");

  // Calculate statistics
  const stats = {
    totalRevenue: events?.reduce((sum, event) => 
      event.event_type === 'payment_received' ? (sum + (event.amount || 0)) : sum, 0
    ) || 0,
    totalMembers: 123,
    activeSubscriptions: 45,
    messagesSent: 678,
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

  const isLoading = !events;

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your community
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[68px] w-full" />
            ) : (
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[68px] w-full" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalMembers.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total members in the community
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[68px] w-full" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Active subscriptions this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[68px] w-full" />
            ) : (
              <div className="text-2xl font-bold">{stats.messagesSent.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total messages sent this month
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>
            Revenue and message statistics over time
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div>
            {isLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : (
              <div>Chart</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
