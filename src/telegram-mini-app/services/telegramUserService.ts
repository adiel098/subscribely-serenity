
import { supabase } from "@/integrations/supabase/client";
import { TelegramUser } from "../utils/telegramUserUtils";

/**
 * Fetch user data from database
 */
export const fetchUserFromDatabase = async (telegramId: string): Promise<any> => {
  console.log('📌 Looking up user with telegram_id:', telegramId);
  
  try {
    const { data: dbUser, error: dbError } = await supabase
      .from('telegram_mini_app_users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    if (dbError) {
      console.error("❌ Error fetching user from database:", dbError);
      return { error: dbError };
    }
    
    if (dbUser) {
      console.log('✅ User found in database:', dbUser);
      return { user: dbUser };
    }
    
    console.log('⚠️ User not found in database');
    return { user: null };
  } catch (error) {
    console.error("❌ Exception when fetching user data:", error);
    return { error };
  }
};

/**
 * Create or update user via edge function
 */
export const createOrUpdateUser = async (userData: TelegramUser, communityId: string): Promise<any> => {
  console.log('🔍 Creating/updating user via edge function...');
  
  try {
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
      return { error: response.error };
    }
    
    if (response.data?.user) {
      console.log('✅ User created/updated via edge function:', response.data.user);
      return { user: response.data.user };
    }
    
    return { user: null };
  } catch (error) {
    console.error("❌ Exception when calling edge function:", error);
    return { error };
  }
};
