
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember } from "../types.ts";

/**
 * Log successful notification to the database
 */
export async function logSuccessfulNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  notificationType: string
): Promise<void> {
  try {
    const memberId = member.id || member.member_id;
    if (!memberId) {
      console.error("Missing member ID in logSuccessfulNotification:", JSON.stringify(member, null, 2));
      throw new Error("Missing member ID");
    }

    // Convert notification type to match allowed values in the database
    // Map the reminder types to valid constraint values
    let validNotificationType = notificationType;
    if (["first_reminder", "second_reminder"].includes(notificationType)) {
      validNotificationType = "reminder";
    }

    // Log the notification to the subscription_notifications table
    // Using 'success' instead of 'sent' for status as it appears 'sent' is not in the allowed values
    const { error } = await supabase
      .from("subscription_notifications")
      .insert({
        member_id: memberId,
        community_id: member.community_id,
        notification_type: validNotificationType,
        status: "success" // Changed from 'sent' to 'success'
      });

    if (error) {
      console.error("Error logging notification:", error);
      throw error;
    }

    console.log(`Successfully logged ${notificationType} notification for member ${memberId}`);
  } catch (error) {
    console.error("Failed to log notification:", error);
  }
}
