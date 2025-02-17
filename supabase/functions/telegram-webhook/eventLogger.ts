
import { SupabaseClient } from "@supabase/supabase-js";

interface EventLogParams {
  communityId: string;
  eventType: string;
  userId?: string | null;
  metadata?: Record<string, any>;
  amount?: number | null;
}

export const logEvent = async (
  supabaseClient: SupabaseClient,
  { communityId, eventType, userId = null, metadata = {}, amount = null }: EventLogParams
) => {
  console.log('Logging event:', { communityId, eventType, userId, metadata, amount });

  try {
    const { data, error } = await supabaseClient
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
      console.error('Error logging event:', error);
      throw error;
    }

    console.log('Successfully logged event:', data);
    return data;
  } catch (error) {
    console.error('Failed to log event:', error);
    throw error;
  }
};
