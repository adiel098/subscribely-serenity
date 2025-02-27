
import { supabase } from "@/integrations/supabase/client";

export interface UserExistsResponse {
  exists: boolean;
  hasEmail: boolean;
}

/**
 * Check if a user exists in the database
 * @param telegramId Telegram user ID
 * @returns Object with exists and hasEmail flags
 */
export const checkUserExists = async (telegramId: string): Promise<UserExistsResponse> => {
  console.log('🔍 Checking if user exists in database:', telegramId);
  try {
    const { data, error } = await supabase
      .from('telegram_mini_app_users')
      .select('email')
      .eq('telegram_id', telegramId)
      .maybeSingle();
    
    if (error) {
      console.error('❌ Error checking user exists:', error);
      throw error;
    }
    
    const exists = !!data;
    const hasEmail = exists && !!data.email;
    
    console.log('✅ User check result:', { exists, hasEmail, data });
    return { exists, hasEmail };
  } catch (error) {
    console.error('❌ Exception in checkUserExists:', error);
    throw error;
  }
};

/**
 * Collect user email and save to database
 * @param telegramUserId Telegram user ID
 * @param email Email address to save
 * @returns Success flag
 */
export const collectUserEmail = async (telegramUserId: string, email: string): Promise<boolean> => {
  console.log('📧 Collecting email for user:', telegramUserId, email);
  
  try {
    // Check if user exists
    const { exists } = await checkUserExists(telegramUserId);
    
    if (exists) {
      // Update existing user
      const { error } = await supabase
        .from('telegram_mini_app_users')
        .update({ email })
        .eq('telegram_id', telegramUserId);
      
      if (error) {
        console.error('❌ Error updating user email:', error);
        return false;
      }
      
      console.log('✅ Email updated successfully for existing user');
      return true;
    } else {
      // Create new user with email
      const { error } = await supabase
        .from('telegram_mini_app_users')
        .insert({ telegram_id: telegramUserId, email });
      
      if (error) {
        console.error('❌ Error creating user with email:', error);
        return false;
      }
      
      console.log('✅ New user with email created successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Exception in collectUserEmail:', error);
    return false;
  }
};

/**
 * Create or update a Telegram mini app user
 */
export const createOrUpdateMember = async (userData: any, communityId: string): Promise<boolean> => {
  console.log('🔍 Creating/updating member:', userData.id, 'for community:', communityId);
  
  try {
    // Check if user exists
    const { exists } = await checkUserExists(userData.id);
    
    if (exists) {
      // Update existing user
      const { error } = await supabase
        .from('telegram_mini_app_users')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          community_id: communityId,
          last_active: new Date()
        })
        .eq('telegram_id', userData.id);
      
      if (error) {
        console.error('❌ Error updating member:', error);
        return false;
      }
      
      console.log('✅ Member updated successfully');
      return true;
    } else {
      // Create new user
      const { error } = await supabase
        .from('telegram_mini_app_users')
        .insert({
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          community_id: communityId
        });
      
      if (error) {
        console.error('❌ Error creating member:', error);
        return false;
      }
      
      console.log('✅ New member created successfully');
      return true;
    }
  } catch (error) {
    console.error('❌ Exception in createOrUpdateMember:', error);
    return false;
  }
};
