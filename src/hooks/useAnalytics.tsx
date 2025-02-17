
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsEvent {
  id: string;
  community_id: string;
  event_type: string;
  user_id: string | null;
  metadata: Record<string, any>;
  amount: number | null;
  created_at: string;
}

export const useAnalytics = (communityId: string) => {
  return useQuery({
    queryKey: ['analytics', communityId],
    queryFn: async () => {
      if (!communityId) return null;

      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return events as AnalyticsEvent[];
    },
    enabled: Boolean(communityId),
  });
};
