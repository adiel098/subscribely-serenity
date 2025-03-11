
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface BroadcastStatsProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastStats = ({ entityId, entityType }: BroadcastStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['broadcast-stats', entityId, entityType],
    queryFn: async () => {
      const query = supabase
        .from('broadcast_messages')
        .select('*, total_recipients, sent_success, sent_failed')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (entityType === 'community') {
        query.eq('community_id', entityId);
      } else {
        query.eq('group_id', entityId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching broadcast stats:', error);
        throw error;
      }
      
      return data?.[0] || { total_recipients: 0, sent_success: 0, sent_failed: 0 };
    },
    enabled: Boolean(entityId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.total_recipients || 0}</div>
            <div className="text-sm text-muted-foreground">Total Recipients</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{stats?.sent_success || 0}</div>
            <div className="text-sm text-muted-foreground">Successfully Sent</div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{stats?.sent_failed || 0}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
