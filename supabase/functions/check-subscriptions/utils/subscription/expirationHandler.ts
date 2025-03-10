
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { updateMemberStatusToExpired, logExpirationActivity } from "./services/memberStatusService.ts";
import { sendExpirationNotification } from "./services/expirationNotificationService.ts";
import { removeMemberFromChat } from "./services/memberRemovalService.ts";

const DEFAULT_MINI_APP_URL = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";

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

  console.log(`🔍 EXPIRATION HANDLER: Processing expired subscription for user ${member.telegram_user_id} in community ${member.community_id}`);
  console.log(`📋 EXPIRATION HANDLER: Full member data: ${JSON.stringify(member, null, 2)}`);
  console.log(`📋 EXPIRATION HANDLER: Full bot settings: ${JSON.stringify(botSettings, null, 2)}`);
  console.log(`⚙️ EXPIRATION HANDLER: Auto remove expired: ${botSettings.auto_remove_expired ? 'ENABLED' : 'DISABLED'}`);

  try {
    result.action = "expiration";
    result.details = "Subscription expired";

    // Step 1: Update member status in database - IMPORTANT: Do this first
    const statusUpdated = await updateMemberStatusToExpired(supabase, member, result);
    console.log(`EXPIRATION HANDLER: Status update result: ${statusUpdated ? "Success ✅" : "Failed ❌"}`);

    // Step 2: Log the expiration in activity logs
    const activityLogged = await logExpirationActivity(supabase, member, result);
    console.log(`EXPIRATION HANDLER: Activity logging result: ${activityLogged ? "Success ✅" : "Failed ❌"}`);

    // Step 3: Send expiration notification to member
    const notificationSent = await sendExpirationNotification(supabase, member, botSettings, result);
    console.log(`EXPIRATION HANDLER: Notification result: ${notificationSent ? "Success ✅" : "Failed ❌"}`);

    // Step 4: Remove member from chat if auto-remove is enabled
    if (botSettings.auto_remove_expired) {
      console.log(`🚫 EXPIRATION HANDLER: Auto-remove is ENABLED - Attempting to remove user ${member.telegram_user_id} from chat`);
      const removalResult = await removeMemberFromChat(supabase, member, result);
      console.log(`🔄 EXPIRATION HANDLER: Member removal result: ${removalResult ? "Success ✅" : "Failed ❌"}`);
      console.log(`🔄 EXPIRATION HANDLER: After removal process - Result details: ${result.details}`);
    } else {
      console.log(`ℹ️ EXPIRATION HANDLER: Auto-remove is DISABLED - User ${member.telegram_user_id} will remain in chat`);
    }
    
    console.log(`🏁 EXPIRATION HANDLER: Completed handling expired subscription for user ${member.telegram_user_id}`);
    console.log(`📋 EXPIRATION HANDLER: Final result object: ${JSON.stringify(result, null, 2)}`);
  } catch (error) {
    console.error(`❌ EXPIRATION HANDLER: Unexpected error: ${error.message}`, error);
    result.action = "error";
    result.details = `Error handling expired subscription: ${error.message}`;
  }
}
