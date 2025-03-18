
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface BroadcastStatsProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BroadcastStats = ({ entityId, entityType }: BroadcastStatsProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['broadcast-stats', entityId, entityType],
    queryFn: async () => {
      // For both communities and groups, query by community_id
      const query = supabase
        .from('broadcast_messages')
        .select('id, status, sent_success, sent_failed, total_recipients, created_at')
        .eq('community_id', entityId)  // We store both community and group IDs in the community_id column
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching broadcast stats:', error);
        return { recentMessages: [], totalSent: 0 };
      }
      
      // Count total messages sent in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentCount = await supabase
        .from('broadcast_messages')
        .select('id', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('community_id', entityId);
      
      return { 
        recentMessages: data || [],
        totalSent: recentCount.count || 0
      };
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Broadcasts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {stats?.totalSent || 0} broadcasts sent in the last 30 days
          </p>
          
          {stats?.recentMessages && stats.recentMessages.length > 0 ? (
            <div className="space-y-2">
              {stats.recentMessages.map((message) => (
                <div 
                  key={message.id} 
                  className="flex justify-between items-center border p-2 rounded-md"
                >
                  <div>
                    <span className="text-sm font-medium">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {message.sent_success} sent
                    </span>
                    {message.sent_failed > 0 && (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">
                        {message.sent_failed} failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              No recent broadcasts found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
