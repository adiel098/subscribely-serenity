
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BotStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
}

export const useBotStats = (communityId: string) => {
  return useQuery({
    queryKey: ['bot-stats', communityId],
    queryFn: async (): Promise<BotStats> => {
      if (!communityId) {
        throw new Error('Community ID is required');
      }

      const { data, error } = await supabase
        .from('telegram_chat_members')
        .select('is_active, last_active')
        .eq('community_id', communityId);

      if (error) {
        console.error('Error fetching bot stats:', error);
        throw error;
      }

      const totalMembers = data.length;
      const activeMembers = data.filter(member => 
        member.is_active && member.last_active && 
        new Date(member.last_active) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length;

      return {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers
      };
    },
    enabled: Boolean(communityId),
  });
};
