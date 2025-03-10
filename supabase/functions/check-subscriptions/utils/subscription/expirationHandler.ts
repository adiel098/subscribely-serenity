
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { updateMemberStatusToExpired, logExpirationActivity } from "./services/memberStatusService.ts";
import { sendExpirationNotification } from "./services/expirationNotificationService.ts";
import { removeMemberFromChat } from "./services/memberRemovalService.ts";

/**
 * Handles expired subscription members
 */
export async function handleExpiredSubscription(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  result: any
): Promise<void> {
  if (!member || !member.id || !member.telegram_user_id || !member.community_id) {
    console.error("❌ Invalid member data:", member);
    result.action = "error";
    result.details = "Invalid member data";
    return;
  }

  console.log(`🔍 EXPIRATION HANDLER: Processing expired subscription for user ${member.telegram_user_id}`);

  try {
    result.action = "expiration";
    result.details = "Subscription expired";

    // Step 1: Update member status to expired - IMPORTANT: Do this first
    await updateMemberStatusToExpired(supabase, member, result);
    
    // Step 2: Log the expiration
    await logExpirationActivity(supabase, member, result);
    
    // Step 3: Send expiration notification
    await sendExpirationNotification(supabase, member, botSettings, result);

    // Step 4: Remove member if auto-remove is enabled
    if (botSettings.auto_remove_expired) {
      console.log(`🚫 EXPIRATION HANDLER: Auto-remove is enabled - Removing user ${member.telegram_user_id}`);
      
      // CRITICAL FIX: Always explicitly pass 'expired' as the reason for proper status tracking
      // This ensures the removal process doesn't override our status
      const removalResult = await removeMemberFromChat(supabase, member, result, 'expired');
      
      if (removalResult) {
        console.log(`✅ EXPIRATION HANDLER: Successfully removed expired member ${member.telegram_user_id}`);
      } else {
        console.error(`❌ EXPIRATION HANDLER: Failed to remove expired member ${member.telegram_user_id}`);
      }
    } else {
      console.log(`ℹ️ EXPIRATION HANDLER: Auto-remove is disabled - User ${member.telegram_user_id} will remain in chat`);
    }
    
    console.log(`🏁 EXPIRATION HANDLER: Completed handling expired subscription for user ${member.telegram_user_id}`);

  } catch (error) {
    console.error(`❌ EXPIRATION HANDLER: Error: ${error.message}`, error);
    result.action = "error";
    result.details = `Error handling expired subscription: ${error.message}`;
  }
}
