import { Card, CardContent } from "@/features/community/components/ui/card";
import { useBotStats } from "@/hooks/community/useBotStats";
import { Users, UserCheck, UserX, RefreshCw } from "lucide-react";
import { Button } from "@/features/community/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BotStatsHeaderProps {
  communityId: string;
}

export const BotStatsHeader = ({ communityId }: BotStatsHeaderProps) => {
  const { data: stats, isLoading, refetch } = useBotStats(communityId);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateActivity = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase.functions.invoke('telegram-webhook', {
        body: { 
          communityId,
          path: '/update-activity'
        }
      });

      if (error) throw error;

      toast.success("Successfully updated member activity status");
      refetch();
    } catch (error) {
      console.error('Error updating member activity:', error);
      toast.error("Failed to update member activity status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !stats) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bot Statistics</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleUpdateActivity}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          Update Activity Status
        </Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
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
                <p className="text-sm text-muted-foreground">Active with Bot</p>
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
                <p className="text-sm text-muted-foreground">Blocked or Inactive</p>
                <p className="text-2xl font-bold">{stats.inactiveMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
