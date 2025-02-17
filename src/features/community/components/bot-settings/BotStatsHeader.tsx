
import { useBotStats } from "@/hooks/community/useBotStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/community/components/ui/card";
import { Button } from "@/features/community/components/ui/button";
import { RefreshCw } from "lucide-react";

interface BotStatsHeaderProps {
  communityId: string;
}

export const BotStatsHeader = ({ communityId }: BotStatsHeaderProps) => {
  const { data: stats, isLoading, refetch } = useBotStats(communityId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.total_messages || 0}</div>
          <p className="text-xs text-muted-foreground">past 30 days</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.active_users || 0}</div>
          <p className="text-xs text-muted-foreground">interacting with bot</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.response_rate ? `${Math.round(stats.response_rate * 100)}%` : '0%'}
          </div>
          <p className="text-xs text-muted-foreground">average response time</p>
        </CardContent>
      </Card>
    </div>
  );
};
