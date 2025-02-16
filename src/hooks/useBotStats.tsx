
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BotStats {
  totalMembers: number;
  activeMembers: number;
  subscribedMembers: number;
  expiredMembers: number;
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
        .select('subscription_status, last_active, is_active')
        .eq('community_id', communityId);

      if (error) {
        console.error('Error fetching bot stats:', error);
        throw error;
      }

      // Consider a member active if they've been active in the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      return {
        totalMembers: members.length,
        activeMembers: members.filter(member => member.is_active).length,
        subscribedMembers: members.filter(m => m.subscription_status).length,
        expiredMembers: members.filter(m => !m.subscription_status).length
      };
    },
    enabled: Boolean(communityId),
  });
};
