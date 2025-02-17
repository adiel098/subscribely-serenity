
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
  console.log('=== Starting logAnalyticsEvent ===');
  console.log('Input parameters:', {
    communityId,
    eventType,
    userId,
    metadata,
    amount
  });

  if (!communityId) {
    console.error('Cannot log analytics event: Missing community ID');
    return;
  }

  // וידוא שה-metadata הוא אובייקט תקין
  const validMetadata = typeof metadata === 'object' ? metadata : {};
  console.log('Validated metadata:', validMetadata);

  const eventData = {
    community_id: communityId,
    event_type: eventType,
    user_id: userId,
    metadata: validMetadata,
    amount: amount
  };

  console.log('Prepared event data for insert:', eventData);

  try {
    console.log('Attempting to insert into community_logs...');
    const { data, error } = await supabase
      .from('community_logs')
      .insert(eventData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Successfully inserted event, returned data:', data);
    return data as AnalyticsEvent;
  } catch (error) {
    console.error('Full error object:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  } finally {
    console.log('=== Finished logAnalyticsEvent ===');
  }
};

export const useAnalytics = (communityId: string) => {
  return useQuery({
    queryKey: ['analytics', communityId],
    queryFn: async () => {
      console.log('=== Starting analytics query ===');
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
        console.error('Error fetching analytics:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('Successfully fetched analytics events:', events);
      console.log('=== Finished analytics query ===');
      return events as AnalyticsEvent[];
    },
    enabled: Boolean(communityId),
  });
};
