
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
  userId: string | null = null,
  metadata: Record<string, any> = {},
  amount: number | null = null
) => {
  if (!communityId) {
    console.error('Cannot log analytics event: Missing community ID');
    return;
  }

  // וידוא שה-metadata הוא אובייקט תקין
  const validMetadata = typeof metadata === 'object' ? metadata : {};

  try {
    const { data, error } = await supabase
      .from('community_logs')
      .insert({
        community_id: communityId,
        event_type: eventType,
        user_id: userId,
        metadata: validMetadata,
        amount: amount
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging analytics event:', error);
      throw error;
    }

    console.log('Successfully logged analytics event:', data);
    return data as AnalyticsEvent;
  } catch (error) {
    console.error('Failed to log analytics event:', error);
    throw error;
  }
};

export const useAnalytics = (communityId: string) => {
  return useQuery({
    queryKey: ['analytics', communityId],
    queryFn: async () => {
      if (!communityId) {
        console.log('No community ID provided for analytics');
        return null;
      }

      console.log('Fetching analytics for community:', communityId);

      const { data: events, error } = await supabase
        .from('community_logs')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error.message);
        throw error;
      }

      console.log('Fetched analytics events:', events);
      return events as AnalyticsEvent[];
    },
    enabled: Boolean(communityId),
  });
};
