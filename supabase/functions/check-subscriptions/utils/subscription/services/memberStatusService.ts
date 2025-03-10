
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember } from "../../types.ts";

/**
 * Updates member subscription status to expired
 */
export async function updateMemberStatusToExpired(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  result: any
): Promise<boolean> {
  try {
    console.log(`📝 Updating member status to 'expired' for user ${member.telegram_user_id}`);
    
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        subscription_status: 'expired',
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error(`❌ Error updating member status: ${updateError.message}`);
      result.details += `, failed to update status: ${updateError.message}`;
      return false;
    } else {
      console.log(`✅ Successfully updated member status to 'expired'`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error updating member status: ${error.message}`);
    result.details += `, failed to update status: ${error.message}`;
    return false;
  }
}

/**
 * Logs expiration in activity logs
 */
export async function logExpirationActivity(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  result: any
): Promise<boolean> {
  try {
    console.log(`📊 Logging expiration in activity logs for user ${member.telegram_user_id}`);
    
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "subscription_expired",
        details: "Subscription expired automatically",
      });
      
    if (logError) {
      console.error(`❌ Error logging expiration: ${logError.message}`);
      result.details += `, failed to log activity: ${logError.message}`;
      return false;
    } else {
      console.log(`✅ Successfully logged expiration in activity logs`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error logging expiration: ${error.message}`);
    result.details += `, failed to log activity: ${error.message}`;
    return false;
  }
}
