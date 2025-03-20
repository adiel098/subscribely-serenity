
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches the bot token from the global settings
 */
export const getBotToken = async (supabase: ReturnType<typeof createClient>): Promise<string> => {
  const { data: settings, error: settingsError } = await supabase
    .from('telegram_global_settings')
    .select('bot_token')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (settingsError || !settings?.bot_token) {
    console.error("Failed to get bot token:", settingsError);
    throw new Error("Failed to get bot token");
  }
  
  return settings.bot_token;
};
