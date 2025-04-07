
/**
 * Service functions for user-related operations
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

/**
 * Process user data from Telegram initData
 * @param supabase Supabase client
 * @param telegramUser Telegram user object from initData
 * @param communityId Community ID (if applicable)
 * @param groupId Group ID (if applicable)
 * @returns Processed user data
 */
export async function processUserData(
  supabase: ReturnType<typeof createClient>,
  telegramUser: any,
  communityId: string | null = null,
  groupId: string | null = null
) {
  try {
    if (!telegramUser || !telegramUser.id) {
      console.error("❌ Invalid Telegram user data");
      return null;
    }
    
    const telegramUserId = telegramUser.id.toString();
    console.log(`✓ Processing Telegram user: ${telegramUserId}`);
    
    // Check if user already exists in our database
    const { data: existingUser, error: userError } = await supabase
      .from('telegram_mini_app_users')
      .select('*')
      .eq('telegram_id', telegramUserId)
      .single();
    
    if (userError && userError.code !== 'PGRST116') {
      console.error("❌ Error checking for existing user:", userError);
    }

    const userData = {
      telegram_id: telegramUserId,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      username: telegramUser.username || null,
      language_code: telegramUser.language_code || null,
      last_active: new Date().toISOString(),
      subscription_status: false
    };
    
    if (!existingUser) {
      // Create new user
      console.log("✓ Creating new Telegram user record");
      const { data: newUser, error: createError } = await supabase
        .from('telegram_mini_app_users')
        .insert([userData])
        .select()
        .single();
      
      if (createError) {
        console.error("❌ Error creating user record:", createError);
      } else {
        console.log("✅ Created new user record");
        userData.subscription_status = false;
      }
    } else {
      // Update existing user's last active timestamp
      console.log("✓ Updating existing Telegram user record");
      const { error: updateError } = await supabase
        .from('telegram_mini_app_users')
        .update({ last_active: new Date().toISOString() })
        .eq('telegram_id', telegramUserId);
      
      if (updateError) {
        console.error("❌ Error updating user record:", updateError);
      } else {
        console.log("✅ Updated user's last active timestamp");
        userData.subscription_status = existingUser.subscription_status || false;
      }
    }
    
    // If we have a community ID, check user's subscription status
    if (communityId) {
      const { data: subscription, error: subError } = await supabase
        .from('community_subscribers')
        .select('subscription_status, subscription_end_date, is_active')
        .eq('community_id', communityId)
        .eq('telegram_user_id', telegramUserId)
        .maybeSingle();
      
      if (subError) {
        console.error("❌ Error checking subscription status:", subError);
      } else if (subscription) {
        console.log("✅ Found user subscription data:", subscription);
        userData.subscription_status = subscription.subscription_status === 'active' && 
          subscription.is_active && 
          (subscription.subscription_end_date === null || new Date(subscription.subscription_end_date) > new Date());
      }
    }
    
    // If we have a group ID, also check group membership
    if (groupId) {
      // Additional logic for group membership would go here
      console.log("✓ Group membership check would go here for future implementation");
    }
    
    return userData;
  } catch (error) {
    console.error("❌ Error in processUserData:", error);
    return null;
  }
}
