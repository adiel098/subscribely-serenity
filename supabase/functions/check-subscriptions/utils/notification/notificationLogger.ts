
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { logNotification } from "../databaseLogger.ts";
import { SubscriptionMember } from "../types.ts";

/**
 * Log a successful notification
 */
export async function logSuccessfulNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  type: string
): Promise<void> {
  try {
    // Map notification types to supported values
    let notificationType = type;
    
    // Map 'first_reminder' and 'second_reminder' to 'reminder' for compatibility
    if (type === "first_reminder" || type === "second_reminder") {
      notificationType = "reminder";
    }
    
    // Log the notification in subscription_notifications
    await logNotification(
      supabase,
      member.community_id,
      member.id,
      notificationType
    );

    // Log in activity logs for first and second reminders
    if (type === "first_reminder" || type === "second_reminder") {
      await supabase.from("subscription_activity_logs").insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: `${type}_sent`,
        details: `${type === "first_reminder" ? "First" : "Second"} reminder sent`,
      });
    }
    
    console.log(`Notification logged successfully: ${type} (stored as ${notificationType})`);
  } catch (error) {
    console.error(`Error logging notification: ${error.message}`);
  }
}
