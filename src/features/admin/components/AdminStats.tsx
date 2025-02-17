
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, CreditCard, Building2, Bell } from "lucide-react";

export const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Fetch total users (profiles)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch communities stats
      const { data: communities } = await supabase
        .from('communities')
        .select('id, member_count, subscription_count, subscription_revenue');

      const totalCommunities = communities?.length || 0;
      const totalMembers = communities?.reduce((sum, c) => sum + (c.member_count || 0), 0) || 0;
      const totalSubscriptions = communities?.reduce((sum, c) => sum + (c.subscription_count || 0), 0) || 0;
      const totalRevenue = communities?.reduce((sum, c) => sum + (c.subscription_revenue || 0), 0) || 0;

      // Fetch system alerts (logs with event_type = 'alert')
      const { count: alertCount } = await supabase
        .from('system_logs')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'alert');

      return {
        totalUsers: totalUsers || 0,
        totalCommunities,
        totalMembers,
        totalSubscriptions,
        totalRevenue,
        alertCount: alertCount || 0
      };
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/80" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Platform-wide users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Communities</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCommunities.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total communities: {stats.totalMembers.toLocaleString()} members
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubscriptions.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Across all communities
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            All time platform revenue
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
