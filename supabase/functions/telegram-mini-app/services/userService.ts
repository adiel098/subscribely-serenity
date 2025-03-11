
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { WebAppUser } from "../utils/telegramTypes.ts";

/**
 * Processes user data from Telegram Mini App
 */
export async function processUserData(
  supabase: ReturnType<typeof createClient>,
  telegramUser: WebAppUser,
  communityId: string | null,
  groupId: string | null
) {
  // Check if user exists in the database
  const { data: existingUser, error: userError } = await supabase
    .from("telegram_mini_app_users")
    .select("*")
    .eq("telegram_id", telegramUser.id)
    .single();
    
  console.log("Existing user data from DB:", existingUser);
  console.log("User error:", userError);

  if (!existingUser) {
    // Create new user record
    console.log("Creating new user record for:", telegramUser.id);
    await supabase.from("telegram_mini_app_users").insert([
      {
        telegram_id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        community_id: communityId,
        group_id: groupId
      },
    ]);
    
    return telegramUser;
  } else {
    // Update existing user with latest session info
    console.log("Updating existing user:", telegramUser.id);
    const updateData = {
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username,
      photo_url: telegramUser.photo_url,
      last_active: new Date().toISOString()
    };
    
    // Only update community or group ID if this is a direct request for that entity
    if (groupId) {
      updateData.group_id = groupId;
    } else if (communityId) {
      updateData.community_id = communityId;
    }
    
    await supabase
      .from("telegram_mini_app_users")
      .update(updateData)
      .eq("telegram_id", telegramUser.id);
      
    // Include email in userData if available
    const userData = { ...telegramUser };
    if (existingUser.email) {
      console.log("Found email in DB, adding to userData:", existingUser.email);
      userData.email = existingUser.email;
    } else {
      console.log("No email found for user in database");
    }
    
    return userData;
  }
}
