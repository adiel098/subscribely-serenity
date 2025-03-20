
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Fetches the bot token from the global settings
 */
export const getBotToken = async (supabase: ReturnType<typeof createClient>): Promise<string> => {
  // First try with maybeSingle to handle empty results better
  const { data: settings, error: settingsError } = await supabase
    .from('telegram_global_settings')
    .select('bot_token')
    .order('created_at', { ascending: false })
    .maybeSingle();
  
  if (settingsError) {
    console.error("Database error when getting bot token:", settingsError);
    throw new Error(`Database error: ${settingsError.message}`);
  }
  
  if (!settings || !settings.bot_token) {
    console.error("No bot token found in global settings");
    throw new Error("No bot token found in telegram_global_settings table. Please ensure a bot token is configured.");
  }
  
  return settings.bot_token;
};
