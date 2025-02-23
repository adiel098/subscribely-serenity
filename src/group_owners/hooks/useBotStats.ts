
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
        return {
          totalMembers: 0,
          activeMembers: 0,
          inactiveMembers: 0
        };
      }

      const { data: members, error } = await supabase
        .from('telegram_chat_members')
        .select('is_active')
        .eq('community_id', communityId);

      if (error) {
        console.error('Error fetching bot stats:', error);
        throw error;
      }

      const totalMembers = members.length;
      const activeMembers = members.filter(m => m.is_active).length;
      const inactiveMembers = totalMembers - activeMembers;

      return {
        totalMembers,
        activeMembers,
        inactiveMembers
      };
    },
    enabled: Boolean(communityId)
  });
};
