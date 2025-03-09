
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

/**
 * Logs a notification to the subscription_notifications table
 */
export async function logNotification(
  supabase: ReturnType<typeof createClient>,
  communityId: string,
  memberId: string,
  notificationType: string
): Promise<void> {
  try {
    const { error } = await supabase.from("subscription_notifications").insert({
      community_id: communityId,
      member_id: memberId,
      notification_type: notificationType,
      status: "sent",
    });
    
    if (error) {
      console.error(`Error logging notification: ${error.message}`);
    }
  } catch (err) {
    console.error(`Failed to log notification: ${err.message}`);
  }
}
