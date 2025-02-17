
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BroadcastStats } from "@/features/community/components/bot-settings/BroadcastStats";

export const useBroadcastStats = (communityId: string) => {
  return useQuery({
    queryKey: ['broadcast-stats', communityId],
    queryFn: async (): Promise<BroadcastStats> => {
      const { data, error } = await supabase
        .from('broadcast_stats')
        .select('*')
        .eq('community_id', communityId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: Boolean(communityId),
  });
};
