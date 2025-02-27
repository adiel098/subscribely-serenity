
import { supabase } from "@/integrations/supabase/client";
import { UserExistsResponse, CreateMemberData } from "./types/memberTypes";

/**
 * Checks if a Telegram user exists in the database and if they have an email
 * @param telegramUserId Telegram user ID
 * @returns Object with exists and hasEmail flags
 */
export async function checkUserExists(telegramUserId: string): Promise<UserExistsResponse> {
  console.log("Checking if user exists:", telegramUserId);

  if (!telegramUserId) {
    console.error("checkUserExists: No telegram user ID provided");
    return { exists: false, hasEmail: false };
  }

  try {
    const { data, error } = await supabase
      .from('telegram_mini_app_users')
      .select('id, email')
      .eq('telegram_id', telegramUserId)
      .maybeSingle();

    if (error) {
      console.error("Error checking user existence:", error);
      throw new Error(error.message);
    }

    const exists = !!data;
    const hasEmail = exists && !!data.email;
    
    console.log(`User ${telegramUserId} exists: ${exists}, has email: ${hasEmail}`);
    return { exists, hasEmail };
  } catch (error) {
    console.error("Failed to check user existence:", error);
    return { exists: false, hasEmail: false };
  }
}

/**
 * Collects and stores a user's email address
 * @param telegramUserId Telegram user ID
 * @param email Email address to store
 * @returns Boolean indicating success
 */
export async function collectUserEmail(telegramUserId: string, email: string): Promise<boolean> {
  console.log("Collecting email for user ID:", telegramUserId, "Email:", email);

  if (!telegramUserId || !email) {
    console.error("collectUserEmail: Missing required parameters");
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { action: "update_user_email", telegram_user_id: telegramUserId, email: email }
    });

    if (error) {
      console.error("Error updating user email:", error);
      throw new Error(error.message);
    }

    console.log("Email collected successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to collect email:", error);
    return false;
  }
}

/**
 * Creates or updates a member in a community
 * @param memberData Member data object
 * @returns Boolean indicating success
 */
export async function createOrUpdateMember(memberData: CreateMemberData): Promise<boolean> {
  console.log("Creating/updating member:", memberData);

  if (!memberData.telegram_id || !memberData.community_id || !memberData.subscription_plan_id) {
    console.error("createOrUpdateMember: Missing required parameters");
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { 
        action: "create_or_update_member", 
        telegram_id: memberData.telegram_id,
        community_id: memberData.community_id,
        subscription_plan_id: memberData.subscription_plan_id,
        status: memberData.status || 'active',
        payment_id: memberData.payment_id
      }
    });

    if (error) {
      console.error("Error creating/updating member:", error);
      throw new Error(error.message);
    }

    console.log("Member created/updated successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to create/update member:", error);
    return false;
  }
}
