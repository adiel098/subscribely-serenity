
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "../types/telegram-user.types";

/**
 * Fetch user data from the database
 */
export const fetchUserFromDatabase = async (telegramId: string): Promise<any> => {
  console.log('🔍 Fetching additional info from database...');
  console.log('📌 Looking up user with telegram_id:', telegramId);
  
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
    return dbUser;
  }
  
  console.log('⚠️ User not found in database');
  return null;
};

/**
 * Create or update user via edge function
 */
export const createOrUpdateUser = async (userData: TelegramUser, communityId: string): Promise<any> => {
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
    
    if (response.data?.user) {
      console.log('✅ User created/updated via edge function:', response.data.user);
      return response.data.user;
    }
    
    return null;
  } catch (edgeFunctionError) {
    console.error("❌ Exception when calling edge function:", edgeFunctionError);
    return null;
  }
};
