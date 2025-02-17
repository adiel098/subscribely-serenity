
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Event {
  id: string;
  event_type: string;
  description: string;
  created_at: string;
  amount?: number;
}

export const useEvents = (communityId: string) => {
  return useQuery({
    queryKey: ['events', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Event[];
    },
    enabled: Boolean(communityId)
  });
};
