
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { logServiceAction } from "./utils/serviceUtils";

/**
 * Fetches a Telegram user by their Telegram ID.
 * This function only retrieves the user and does NOT create a user record.
 */
export async function fetchTelegramUserById(telegramUserId: string): Promise<TelegramUser | null> {
  logServiceAction("fetchTelegramUserById", { telegramUserId });
  
  if (!telegramUserId) {
    console.error("❌ fetchTelegramUserById: Missing required telegramUserId parameter");
    return null;
  }

  try {
    // Get user data from the database
    const { data, error } = await supabase
      .from('telegram_mini_app_users')
      .select('*')
      .eq('telegram_id', telegramUserId)
      .maybeSingle();
    
    if (error) {
      console.error("❌ Error fetching user data:", error);
      throw error;
    }
    
    // Return the user data if found
    return data as TelegramUser | null;
  } catch (error) {
    console.error("❌ Failed to fetch Telegram user:", error);
    return null;
  }
}
