
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
      if (!communityId) throw new Error('Community ID is required');

      const { data, error } = await supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('community_id', communityId);

      if (error) throw error;

      const totalMembers = data.length;
      const activeMembers = data.filter(member => member.subscription_status).length;
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
