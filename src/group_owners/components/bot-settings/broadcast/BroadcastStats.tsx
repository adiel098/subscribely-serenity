
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChartBar, CalendarDays, Check, X } from "lucide-react";
import { motion } from "framer-motion";

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
        .eq('community_id', entityId)
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
      <Card className="border-indigo-100 shadow-sm">
        <CardContent className="pt-6 flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 p-1.5 rounded-full">
            <ChartBar className="h-4 w-4 text-purple-600" />
          </div>
          <CardTitle className="text-base font-semibold text-purple-900">Recent Broadcasts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground flex items-center">
            <CalendarDays className="h-4 w-4 mr-1.5 text-purple-500" />
            <span className="font-medium text-purple-700">{stats?.totalSent || 0}</span> broadcasts sent in the last 30 days
          </p>
          
          {stats?.recentMessages && stats.recentMessages.length > 0 ? (
            <div className="space-y-2">
              {stats.recentMessages.map((message, index) => (
                <motion.div 
                  key={message.id} 
                  className="flex justify-between items-center border border-slate-200 p-2 rounded-md bg-white hover:bg-slate-50 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <div>
                    <span className="text-sm font-medium text-slate-700">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      {message.sent_success}
                    </span>
                    {message.sent_failed > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {message.sent_failed}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-muted-foreground text-sm">
                No recent broadcasts found
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Your broadcast history will appear here 📊
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
