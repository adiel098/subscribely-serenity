import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ChartBar, CalendarDays, Check, X } from "lucide-react";
import { motion } from "framer-motion";
interface BroadcastStatsProps {
  entityId: string;
  entityType: 'community' | 'group';
}
export const BroadcastStats = ({
  entityId,
  entityType
}: BroadcastStatsProps) => {
  const {
    data: stats,
    isLoading
  } = useQuery({
    queryKey: ['broadcast-stats', entityId, entityType],
    queryFn: async () => {
      // For both communities and groups, query by community_id
      const query = supabase.from('broadcast_messages').select('id, status, sent_success, sent_failed, total_recipients, created_at').eq('community_id', entityId).order('created_at', {
        ascending: false
      }).limit(5);
      const {
        data,
        error
      } = await query;
      if (error) {
        console.error('Error fetching broadcast stats:', error);
        return {
          recentMessages: [],
          totalSent: 0
        };
      }

      // Count total messages sent in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCount = await supabase.from('broadcast_messages').select('id', {
        count: 'exact'
      }).gte('created_at', thirtyDaysAgo.toISOString()).eq('community_id', entityId);
      return {
        recentMessages: data || [],
        totalSent: recentCount.count || 0
      };
    },
    refetchInterval: 10000 // Refresh every 10 seconds
  });
  if (isLoading) {
    return <Card className="border-indigo-100 shadow-sm">
        <CardContent className="pt-6 flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </CardContent>
      </Card>;
  }
  return;
};