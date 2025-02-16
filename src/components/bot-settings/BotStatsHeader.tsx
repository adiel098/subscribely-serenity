
import { Card, CardContent } from "@/components/ui/card";
import { useBotStats } from "@/hooks/useBotStats";
import { Users, UserCheck, UserX } from "lucide-react";

interface BotStatsHeaderProps {
  communityId: string;
}

export const BotStatsHeader = ({ communityId }: BotStatsHeaderProps) => {
  const { data: stats, isLoading } = useBotStats(communityId);

  if (isLoading || !stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold">{stats.activeMembers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <UserX className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Inactive Members</p>
              <p className="text-2xl font-bold">{stats.inactiveMembers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
