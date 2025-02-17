
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, CreditCard, Building2, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  totalUsers: number;
  totalCommunities: number;
  totalMembers: number;
  totalSubscriptions: number;
  totalRevenue: number;
  alertCount: number;
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  isLoading 
}: { 
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </>
      ) : (
        <>
          <div className="text-2xl font-bold">
            {title === "Total Revenue" ? "$" : ""}{value.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </>
      )}
    </CardContent>
  </Card>
);

export const AdminStats = () => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      try {
        // Fetch total users (profiles)
        const { count: totalUsers, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        // Fetch communities stats
        const { data: communities, error: communitiesError } = await supabase
          .from('communities')
          .select('id, member_count, subscription_count, subscription_revenue');

        if (communitiesError) throw communitiesError;

        const totalCommunities = communities?.length || 0;
        const totalMembers = communities?.reduce((sum, c) => sum + (c.member_count || 0), 0) || 0;
        const totalSubscriptions = communities?.reduce((sum, c) => sum + (c.subscription_count || 0), 0) || 0;
        const totalRevenue = communities?.reduce((sum, c) => sum + (c.subscription_revenue || 0), 0) || 0;

        // Fetch system alerts (logs with event_type = 'alert')
        const { count: alertCount, error: alertsError } = await supabase
          .from('system_logs')
          .select('*', { count: 'exact', head: true })
          .eq('event_type', 'alert');

        if (alertsError) throw alertsError;

        return {
          totalUsers: totalUsers || 0,
          totalCommunities,
          totalMembers,
          totalSubscriptions,
          totalRevenue,
          alertCount: alertCount || 0
        };
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Return default values in case of error
        return {
          totalUsers: 0,
          totalCommunities: 0,
          totalMembers: 0,
          totalSubscriptions: 0,
          totalRevenue: 0,
          alertCount: 0
        };
      }
    },
  });

  const defaultStats: Stats = {
    totalUsers: 0,
    totalCommunities: 0,
    totalMembers: 0,
    totalSubscriptions: 0,
    totalRevenue: 0,
    alertCount: 0
  };

  const displayStats = stats || defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Users"
        value={displayStats.totalUsers}
        description="Platform-wide users"
        icon={Users}
        isLoading={isLoading}
      />
      <StatCard
        title="Communities"
        value={displayStats.totalCommunities}
        description={`Total communities: ${displayStats.totalMembers.toLocaleString()} members`}
        icon={Building2}
        isLoading={isLoading}
      />
      <StatCard
        title="Active Subscriptions"
        value={displayStats.totalSubscriptions}
        description="Across all communities"
        icon={Bell}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Revenue"
        value={displayStats.totalRevenue}
        description="All time platform revenue"
        icon={CreditCard}
        isLoading={isLoading}
      />
    </div>
  );
};
