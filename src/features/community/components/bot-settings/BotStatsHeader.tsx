
import { Card } from "@/components/ui/card";
import { useBotStats } from "@/hooks/community/useBotStats";
import { CreditCard, Users, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BotStatsHeaderProps {
  communityId: string;
}

export const BotStatsHeader = ({ communityId }: BotStatsHeaderProps) => {
  const { data: botStats, isLoading } = useBotStats(communityId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Active Subscribers</h3>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total Members</h3>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <p className="text-lg font-semibold">${botStats?.totalRevenue || 0}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Active Subscribers</h3>
            <p className="text-lg font-semibold">{botStats?.activeSubscribers || 0}</p>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Total Members</h3>
            <p className="text-lg font-semibold">{botStats?.totalMembers || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
