
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "@/telegram-mini-app/hooks/types/telegramTypes";

/**
 * Get user from database by Telegram ID
 */
export const getUserFromDatabase = async (telegramId: string): Promise<any> => {
  if (!telegramId) {
    console.error("❌ Invalid Telegram ID for database query");
    return null;
  }
  
  console.log('🔍 Fetching additional info from database...');
  console.log('📌 Looking up user with telegram_id:', telegramId);
  
  try {
    // Check if user exists in database and get additional info (like email)
    const { data: dbUser, error: dbError } = await supabase
      .from('telegram_mini_app_users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    if (dbError) {
      console.error("❌ Error fetching user from database:", dbError);
      return null;
    } 
    
    return dbUser;
  } catch (error) {
    console.error("❌ Error in database query:", error);
    return null;
  }
};

/**
 * Create or update user in the database via edge function
 */
export const createOrUpdateUser = async (userData: TelegramUser, communityId: string): Promise<any> => {
  if (!userData.id) {
    console.error("❌ Invalid user data for creation/update");
    return null;
  }
  
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
  
  try {
    const response = await supabase.functions.invoke("telegram-user-manager", {
      body: payload
    });
    
    console.log('📊 Edge function response:', response);
    
    if (response.error) {
      console.error("❌ Error from edge function:", response.error);
      return null;
    } 
    
    return response.data?.user;
  } catch (error) {
    console.error("❌ Exception when calling edge function:", error);
    return null;
  }
};

/**
 * Merge user data from Telegram and database
 */
export const mergeUserData = (telegramData: TelegramUser, dbData: any): TelegramUser => {
  if (!dbData) return telegramData;
  
  return {
    ...telegramData,
    email: dbData.email || undefined,
    // If the database has a photo_url and Telegram doesn't, use the one from the database
    photo_url: telegramData.photo_url || dbData.photo_url || undefined,
    // Same for username
    username: telegramData.username || dbData.username || undefined
  };
};
