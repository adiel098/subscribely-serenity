
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function getBotSettings(supabase: ReturnType<typeof createClient>, communityId: string) {
  const { data: botSettings, error: botSettingsError } = await supabase
    .from('telegram_bot_settings')
    .select('*')
    .eq('community_id', communityId)
    .single();

  if (botSettingsError) {
    console.error('Error fetching bot settings:', botSettingsError);
    throw botSettingsError;
  }

  return botSettings;
}

export async function getGlobalSettings(supabase: ReturnType<typeof createClient>) {
  const { data: globalSettings, error: globalSettingsError } = await supabase
    .from('telegram_global_settings')
    .select('bot_token')
    .single();

  if (globalSettingsError || !globalSettings?.bot_token) {
    console.error('Error fetching bot token:', globalSettingsError);
    throw globalSettingsError;
  }

  return globalSettings;
}
