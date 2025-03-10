
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
    console.log(`📝 STATUS SERVICE: Updating member status to 'expired' for user ${member.telegram_user_id}`);
    console.log(`📝 STATUS SERVICE: Member ID: ${member.id}, Current status: ${member.subscription_status}`);
    
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        subscription_status: 'expired', // Always set to 'expired' for consistency
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error(`❌ STATUS SERVICE: Error updating member status: ${updateError.message}`);
      console.error(`❌ STATUS SERVICE: SQL error details: ${JSON.stringify(updateError)}`);
      result.details += `, failed to update status: ${updateError.message}`;
      return false;
    } else {
      console.log(`✅ STATUS SERVICE: Successfully updated member status to 'expired'`);
      
      // Verify the update was applied correctly
      const { data: verifyData, error: verifyError } = await supabase
        .from("telegram_chat_members")
        .select("subscription_status")
        .eq("id", member.id)
        .single();
        
      if (verifyError) {
        console.error(`❌ STATUS SERVICE: Error verifying status update: ${verifyError.message}`);
      } else {
        console.log(`✅ STATUS SERVICE: Verified status is now: ${verifyData?.subscription_status}`);
      }
      
      return true;
    }
  } catch (error) {
    console.error(`❌ STATUS SERVICE: Error updating member status: ${error.message}`);
    console.error(`❌ STATUS SERVICE: Error stack: ${error.stack}`);
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
    console.log(`📊 ACTIVITY LOG: Logging expiration in activity logs for user ${member.telegram_user_id}`);
    
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "subscription_expired",
        details: "Subscription expired automatically",
        status: "expired" // Add status field for consistency
      });
      
    if (logError) {
      console.error(`❌ ACTIVITY LOG: Error logging expiration: ${logError.message}`);
      result.details += `, failed to log activity: ${logError.message}`;
      return false;
    } else {
      console.log(`✅ ACTIVITY LOG: Successfully logged expiration in activity logs`);
      return true;
    }
  } catch (error) {
    console.error(`❌ ACTIVITY LOG: Error logging expiration: ${error.message}`);
    result.details += `, failed to log activity: ${error.message}`;
    return false;
  }
}
