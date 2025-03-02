
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

/**
 * Create or update a user via edge function
 */
export const createOrUpdateUser = async (
  userData: TelegramUser, 
  communityId: string
): Promise<any | null> => {
  if (!isValidTelegramId(userData.id)) {
    console.error("❌ Invalid Telegram ID format for user creation:", userData.id);
    return null;
  }

  try {
    console.log('🔍 Creating/updating user via edge function...');
    const payload = { 
      telegram_id: userData.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      username: userData.username,
      photo_url: userData.photo_url,
      community_id: communityId
    };
    
    console.log('📌 Edge function payload:', payload);
    
    const response = await supabase.functions.invoke("telegram-user-manager", {
      body: payload
    });
    
    console.log('📊 Edge function response:', response);
    
    if (response.error) {
      console.error("❌ Error from edge function:", response.error);
      return null;
    } else if (response.data?.user) {
      console.log('✅ User created/updated via edge function:', response.data.user);
      return response.data.user;
    }
    
    return null;
  } catch (error) {
    console.error("❌ Exception when calling edge function:", error);
    return null;
  }
};
