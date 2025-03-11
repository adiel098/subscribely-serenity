
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getBotSettings(supabase: ReturnType<typeof createClient>, communityId: string | null, groupId: string | null = null) {
  try {
    let query = supabase
      .from('telegram_bot_settings')
      .select('*');
    
    if (communityId) {
      query = query.eq('community_id', communityId);
    } else if (groupId) {
      query = query.eq('group_id', groupId);
    } else {
      throw new Error('Either communityId or groupId must be provided');
    }
    
    const { data: settings, error } = await query.single();

    if (error) {
      console.error(`Error fetching bot settings for ${communityId ? 'community' : 'group'} ${communityId || groupId}:`, error);
      throw error;
    }

    return settings;
  } catch (error) {
    console.error('Error in getBotSettings:', error);
    throw error;
  }
}

