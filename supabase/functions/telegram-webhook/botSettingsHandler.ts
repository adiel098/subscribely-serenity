
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getBotSettings(supabase: ReturnType<typeof createClient>, communityId: string) {
  try {
    const { data: settings, error } = await supabase
      .from('telegram_bot_settings')
      .select('*')
      .eq('community_id', communityId)
      .single();

    if (error) {
      console.error('Error fetching bot settings:', error);
      throw error;
    }

    return settings;
  } catch (error) {
    console.error('Error in getBotSettings:', error);
    throw error;
  }
}
