
import { supabase } from "@/integrations/supabase/client";

export interface TelegramUserData {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
}

export interface TelegramMiniAppContext {
  userId: string;
  communityId: string;
}

/**
 * Saves or updates a Telegram user's information when they access the mini app
 */
export const saveUserData = async (userData: TelegramUserData, communityId: string) => {
  try {
    console.log('Saving user data:', { userData, communityId });
    
    const { data, error } = await supabase
      .from('telegram_mini_app_users')
      .upsert({
        telegram_id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        photo_url: userData.photo_url,
        community_id: communityId,
        last_active: new Date().toISOString()
      }, {
        onConflict: 'telegram_id',
      });
    
    if (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in saveUserData:', error);
    throw error;
  }
};

/**
 * Gets user information based on Telegram ID
 */
export const getUserByTelegramId = async (telegramId: string) => {
  try {
    const { data, error } = await supabase
      .from('telegram_mini_app_users')
      .select('*')
      .eq('telegram_id', telegramId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getUserByTelegramId:', error);
    throw error;
  }
};

/**
 * Gets subscription information for a user in a community
 */
export const getUserSubscription = async (telegramId: string, communityId: string) => {
  try {
    const { data, error } = await supabase
      .from('telegram_chat_members')
      .select(`
        *,
        plan:subscription_plans(
          id,
          name,
          interval,
          price,
          features
        )
      `)
      .eq('telegram_user_id', telegramId)
      .eq('community_id', communityId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user subscription:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in getUserSubscription:', error);
    throw error;
  }
};
