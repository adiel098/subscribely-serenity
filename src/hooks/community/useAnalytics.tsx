
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  id: string;
  created_at: string;
  event_type: string;
  amount?: number;
  details?: Record<string, any>;
  community_id: string;
}

export const useAnalytics = (communityId: string) => {
  return useQuery({
    queryKey: ['analytics', communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AnalyticsEvent[];
    },
    enabled: Boolean(communityId)
  });
};
