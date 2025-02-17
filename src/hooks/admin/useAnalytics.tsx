import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAnalytics = (communityId: string) => {
  return useQuery({
    queryKey: ['analytics', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_events')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
};
