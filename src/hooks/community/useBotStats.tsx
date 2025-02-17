
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BotStats {
  totalMembers: number;
  activeSubscribers: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  revenuePerSubscriber: number;
}

export const useBotStats = (communityId: string) => {
  return useQuery({
    queryKey: ['bot-stats', communityId],
    queryFn: async (): Promise<BotStats> => {
      if (!communityId) {
        throw new Error('Community ID is required');
      }

      const { data: members, error } = await supabase
        .from('telegram_chat_members')
        .select('is_active')
        .eq('community_id', communityId);

      if (error) {
        console.error('Error fetching bot stats:', error);
        throw error;
      }

      // Count messages sent from analytics_events
      const { data: messages, error: messagesError } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('community_id', communityId)
        .eq('event_type', 'notification_sent');

      if (messagesError) {
        console.error('Error fetching messages count:', messagesError);
        throw messagesError;
      }
      
      return {
        totalMembers: members.length,
        activeSubscribers: members.filter(member => member.is_active).length,
        expiredSubscriptions: members.filter(member => !member.is_active).length,
        totalRevenue: 0,
        revenuePerSubscriber: 0
      };
    },
    enabled: Boolean(communityId),
  });
};
