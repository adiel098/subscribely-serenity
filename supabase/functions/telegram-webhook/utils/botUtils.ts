
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define the TELEGRAM_MINI_APP_URL directly in this file
// This way we don't rely on importing from frontend code which isn't available in edge functions
export const TELEGRAM_MINI_APP_URL = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";

/**
 * Get the bot username from global settings
 */
export async function getBotUsername(supabase: ReturnType<typeof createClient>): Promise<string> {
  try {
    console.log(`[BOT-UTILS] 🔍 Fetching bot username from settings`);
    
    // Get bot settings
    const { data: settings, error } = await supabase
      .from('telegram_global_settings')
      .select('bot_username, bot_token')
      .single();
    
    if (error || !settings) {
      console.error(`[BOT-UTILS] ❌ Error fetching bot settings:`, error);
      
      // If we can't get the username from settings, try to get it from the Telegram API
      if (settings?.bot_token) {
        return await getBotUsernameFromApi(settings.bot_token);
      }
      
      // Default fallback
      return 'membifybot';
    }
    
    if (settings.bot_username) {
      console.log(`[BOT-UTILS] ✅ Found bot username in settings: ${settings.bot_username}`);
      return settings.bot_username;
    } else if (settings.bot_token) {
      // If we have a token but no username, get it from the Telegram API
      return await getBotUsernameFromApi(settings.bot_token);
    }
    
    // Default fallback
    console.log(`[BOT-UTILS] ⚠️ No bot username found, using default: membifybot`);
    return 'membifybot';
  } catch (error) {
    console.error(`[BOT-UTILS] ❌ Error in getBotUsername:`, error);
    return 'membifybot';
  }
}

/**
 * Get bot username from Telegram API
 */
async function getBotUsernameFromApi(botToken: string): Promise<string> {
  try {
    console.log(`[BOT-UTILS] 🔄 Fetching bot username from Telegram API`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    
    if (data.ok && data.result && data.result.username) {
      const username = data.result.username;
      console.log(`[BOT-UTILS] ✅ Got bot username from API: ${username}`);
      return username;
    }
    
    console.error(`[BOT-UTILS] ❌ Failed to get bot username from API:`, data);
    return 'membifybot';
  } catch (error) {
    console.error(`[BOT-UTILS] ❌ Error fetching bot username from API:`, error);
    return 'membifybot';
  }
}
