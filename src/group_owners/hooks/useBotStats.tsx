
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BotStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
}

export const useBotStats = (communityId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bot-stats', communityId],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from('telegram_chat_members')
        .select('*')
        .eq('community_id', communityId);

      if (error) throw error;

      const stats: BotStats = {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.subscription_status).length,
        inactiveMembers: members.filter(m => !m.subscription_status).length
      };

      return stats;
    },
    enabled: Boolean(communityId),
  });

  return { data, isLoading, error, refetch };
};
