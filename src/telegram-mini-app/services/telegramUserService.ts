
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "../types/telegramTypes";
import { isValidTelegramId } from "../utils/telegramUtils";

/**
 * Fetch a user from the database by Telegram ID
 */
export const fetchUserFromDatabase = async (telegramId: string): Promise<any | null> => {
  if (!isValidTelegramId(telegramId)) {
    console.error("❌ Invalid Telegram ID format for database fetch:", telegramId);
    return null;
  }

  try {
    console.log('🔍 Fetching user from database with telegram_id:', telegramId);
    const { data: dbUser, error: dbError } = await supabase
      .from('telegram_mini_app_users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    if (dbError) {
      console.error("❌ Error fetching user from database:", dbError);
      return null;
    }
    
    if (dbUser) {
      console.log('✅ User found in database:', dbUser);
    } else {
      console.log('⚠️ User not found in database');
    }
    
    return dbUser;
  } catch (error) {
    console.error("❌ Exception when fetching user from database:", error);
    return null;
  }
};
