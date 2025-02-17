
import { useBotStats } from "@/features/community/hooks/useBotStats";
import { Card } from "@/components/ui/card";
import { MessageCircle, Users, Clock } from "lucide-react";

interface BotStatsHeaderProps {
  communityId: string;
}

export const BotStatsHeader = ({ communityId }: BotStatsHeaderProps) => {
  const { data: stats } = useBotStats(communityId);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Total Members</h3>
        </div>
        <p className="mt-2 text-2xl font-bold">{stats.totalMembers}</p>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Active Members</h3>
        </div>
        <p className="mt-2 text-2xl font-bold">{stats.activeMembers}</p>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Expired Members</h3>
        </div>
        <p className="mt-2 text-2xl font-bold">{stats.inactiveMembers}</p>
      </Card>
    </div>
  );
};
