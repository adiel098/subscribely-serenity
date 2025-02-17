
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AnalyticsEventType = Database["public"]["Enums"]["analytics_event_type"];

export interface AnalyticsEvent {
  id: string;
  community_id: string;
  event_type: AnalyticsEventType;
  user_id: string | null;
  metadata: Record<string, any>;
  amount: number | null;
  created_at: string;
}

export const logAnalyticsEvent = async (
  communityId: string,
  eventType: AnalyticsEventType,
  userId?: string | null,
  metadata: Record<string, any> = {},
  amount?: number | null
) => {
  console.log('Logging analytics event:', {
    communityId,
    eventType,
    userId,
    metadata,
    amount
  });

  try {
    const { data, error } = await supabase
      .from('community_logs')
      .insert({
        community_id: communityId,
        event_type: eventType,
        user_id: userId,
        metadata,
        amount
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging analytics event:', error);
      throw error;
    }

    console.log('Successfully logged analytics event:', data);
    return data;
  } catch (error) {
    console.error('Failed to log analytics event:', error);
    throw error;
  }
};

export const useAnalytics = (communityId: string) => {
  return useQuery({
    queryKey: ['analytics', communityId],
    queryFn: async () => {
      if (!communityId) return null;

      const { data: events, error } = await supabase
        .from('community_logs')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        throw error;
      }

      console.log('Fetched analytics events:', events);
      return events as AnalyticsEvent[];
    },
    enabled: Boolean(communityId),
  });
};
