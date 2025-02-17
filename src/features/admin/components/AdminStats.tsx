
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/community/components/ui/card";
import { Users, DollarSign, Bell, TrendingUp } from "lucide-react";

interface AdminStats {
  total_users: number;
  total_revenue: number;
  active_communities: number;
  monthly_growth: number;
}

export const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Since we don't have direct access to admin_stats table,
      // let's query the tables directly to calculate stats
      const [usersCount, communityStats, revenueStats] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('communities').select('id', { count: 'exact' }).eq('subscription_count', '>', 0),
        supabase.from('communities').select('subscription_revenue')
      ]);

      if (usersCount.error) throw usersCount.error;
      if (communityStats.error) throw communityStats.error;
      if (revenueStats.error) throw revenueStats.error;

      const totalRevenue = revenueStats.data?.reduce((acc, curr) => acc + (curr.subscription_revenue || 0), 0) || 0;
      
      // Calculate monthly growth (placeholder - you might want to implement actual growth calculation)
      const monthlyGrowth = 5; // Placeholder 5%

      const stats: AdminStats = {
        total_users: usersCount.count || 0,
        total_revenue: totalRevenue,
        active_communities: communityStats.count || 0,
        monthly_growth: monthlyGrowth
      };

      return stats;
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "-" : stats?.total_users || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${isLoading ? "-" : stats?.total_revenue?.toFixed(2) || "0.00"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Communities</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? "-" : stats?.active_communities || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "-" : `${stats?.monthly_growth || 0}%`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
