
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
    console.log(`Logging notification of type: ${notificationType} for member ${memberId}`);
    
    // Check if the notification has already been sent to prevent duplicates
    const { data: existingNotifications, error: checkError } = await supabase
      .from('subscription_notifications')
      .select('id')
      .eq('member_id', memberId)
      .eq('notification_type', notificationType) // Use exact notification type
      .eq('status', 'success')
      .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .limit(1);
    
    if (checkError) {
      console.error(`Error checking existing notifications: ${checkError.message}`);
    } else if (existingNotifications && existingNotifications.length > 0) {
      console.log(`Notification of type ${notificationType} already sent to member ${memberId} in the last 24 hours - skipping`);
      return;
    }
    
    const { error } = await supabase.from("subscription_notifications").insert({
      community_id: communityId,
      member_id: memberId,
      notification_type: notificationType,
      status: "success",
    });
    
    if (error) {
      console.error(`Error logging notification: ${error.message}`);
    } else {
      console.log(`Successfully logged notification with type "${notificationType}"`);
    }
  } catch (err) {
    console.error(`Failed to log notification: ${err.message}`);
  }
}

/**
 * Log a system event for subscription management
 */
export async function logSystemEvent(
  supabase: ReturnType<typeof createClient>,
  eventType: string,
  details: string,
  metadata: any = {}
): Promise<void> {
  try {
    const { error } = await supabase
      .from("system_logs")
      .insert({
        event_type: eventType,
        details: details,
        metadata: metadata
      });
      
    if (error) {
      console.error(`Error logging system event: ${error.message}`);
    }
  } catch (err) {
    console.error(`Failed to log system event: ${err.message}`);
  }
}
