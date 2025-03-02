
import { supabase } from "@/integrations/supabase/client";
import { logServiceAction, validateTelegramId } from "./utils/serviceUtils";

export async function checkUserExists(telegramUserId: string): Promise<{exists: boolean, hasEmail: boolean}> {
  logServiceAction("checkUserExists", { telegramUserId });

  // Validate that telegramUserId is a numeric string (proper Telegram ID format)
  if (!telegramUserId || !/^\d+$/.test(telegramUserId)) {
    console.error("❌ checkUserExists: Invalid Telegram ID format:", telegramUserId);
    console.error("❌ checkUserExists: Telegram ID type:", typeof telegramUserId);
    return { exists: false, hasEmail: false };
  }

  try {
    const { data, error } = await supabase
      .from('telegram_mini_app_users')
      .select('id, email')
      .eq('telegram_id', telegramUserId)
      .maybeSingle();

    if (error) {
      console.error("❌ Error checking user existence:", error);
      throw new Error(error.message);
    }

    const exists = !!data;
    const hasEmail = exists && !!data.email;
    
    logServiceAction("User existence check result", { exists, hasEmail });
    return { exists, hasEmail };
  } catch (error) {
    console.error("❌ Failed to check user existence:", error);
    return { exists: false, hasEmail: false };
  }
}

export async function collectUserEmail(
  telegramUserId: string, 
  email: string, 
  firstName?: string, 
  lastName?: string, 
  communityId?: string,
  username?: string,
  photoUrl?: string
): Promise<boolean> {
  logServiceAction("collectUserEmail", { 
    telegramUserId, 
    email, 
    firstName, 
    lastName, 
    communityId, 
    username, 
    photoUrl 
  });

  // Enhanced validation with detailed error reporting
  if (!telegramUserId) {
    console.error("❌ collectUserEmail: Missing required telegramUserId parameter");
    return false;
  }
  
  if (!email) {
    console.error("❌ collectUserEmail: Missing required email parameter");
    return false;
  }
  
  // Validate that telegramUserId is a numeric string (proper Telegram ID format)
  if (!/^\d+$/.test(telegramUserId)) {
    console.error("❌ collectUserEmail: Invalid Telegram ID format:", telegramUserId);
    console.error("❌ collectUserEmail: Telegram ID type:", typeof telegramUserId);
    return false;
  }

  try {
    // First check if the user exists
    const { exists } = await checkUserExists(telegramUserId);
    
    let result;
    if (exists) {
      // Update existing user with new data
      const updateData: any = { email };
      
      // Only include fields that have values
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (communityId) updateData.community_id = communityId;
      if (username) updateData.username = username;
      if (photoUrl) updateData.photo_url = photoUrl;
      
      console.log("🔄 Updating existing user:", telegramUserId, updateData);
      
      result = await supabase
        .from('telegram_mini_app_users')
        .update(updateData)
        .eq('telegram_id', telegramUserId);
    } else {
      // Create new user with all available data
      const insertData: any = { 
        telegram_id: telegramUserId, 
        email 
      };
      
      // Only include fields that have values
      if (firstName) insertData.first_name = firstName;
      if (lastName) insertData.last_name = lastName;
      if (communityId) insertData.community_id = communityId;
      if (username) insertData.username = username;
      if (photoUrl) insertData.photo_url = photoUrl;
      
      console.log("➕ Creating new user:", telegramUserId, insertData);
      
      result = await supabase
        .from('telegram_mini_app_users')
        .insert(insertData);
    }
    
    if (result.error) {
      console.error("❌ Error updating/inserting user data:", result.error);
      throw new Error(result.error.message);
    }

    logServiceAction("User data collected successfully", { telegramUserId });
    return true;
  } catch (error) {
    console.error("❌ Failed to collect user data:", error);
    return false;
  }
}
