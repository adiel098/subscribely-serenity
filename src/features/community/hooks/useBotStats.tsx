
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BotStats } from "@/types";

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

      const activeMembers = members.filter(member => member.is_active).length;
      const activeSubscribers = members.filter(member => member.is_active).length;
      const expiredSubscriptions = members.filter(member => !member.is_active).length;
      
      return {
        totalMembers: members.length,
        activeMembers,
        inactiveMembers: members.length - activeMembers,
        totalRevenue: 0, // This should be calculated from payments
        revenuePerSubscriber: 0, // This should be calculated from payments
        activeSubscribers,
        expiredSubscriptions
      };
    },
    enabled: Boolean(communityId),
  });
};
