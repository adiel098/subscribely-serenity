
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BotStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  messagesSent: number;
  total_messages: number;
  active_users: number;
  response_rate: number;
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

      const totalMembers = members.length;
      const activeMembers = members.filter(member => member.is_active).length;
      
      return {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers,
        messagesSent: messages?.length || 0,
        total_messages: messages?.length || 0,
        active_users: activeMembers,
        response_rate: activeMembers / (totalMembers || 1)
      };
    },
    enabled: Boolean(communityId),
  });
};
