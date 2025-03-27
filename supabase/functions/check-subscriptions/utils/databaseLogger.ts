
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
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  try {
    console.log(`💌 [${timeStr}] Logging notification of type: ${notificationType} for member ${memberId}`);
    
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
      console.error(`❌ [${timeStr}] Error checking existing notifications: ${checkError.message}`);
    } else if (existingNotifications && existingNotifications.length > 0) {
      console.log(`ℹ️ [${timeStr}] Notification of type ${notificationType} already sent to member ${memberId} in the last 24 hours - skipping`);
      return;
    }
    
    const { error } = await supabase.from("subscription_notifications").insert({
      community_id: communityId,
      member_id: memberId,
      notification_type: notificationType,
      status: "success",
    });
    
    if (error) {
      console.error(`❌ [${timeStr}] Error logging notification: ${error.message}`);
    } else {
      console.log(`✅ [${timeStr}] Successfully logged notification with type "${notificationType}"`);
    }
  } catch (err) {
    console.error(`❌ [${timeStr}] Failed to log notification: ${err.message}`);
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
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  try {
    console.log(`📝 [${timeStr}] Logging system event: ${eventType} - ${details}`);
    
    const { error } = await supabase
      .from("system_logs")
      .insert({
        event_type: eventType,
        details: details,
        metadata: metadata
      });
      
    if (error) {
      console.error(`❌ [${timeStr}] Error logging system event: ${error.message}`);
    } else {
      console.log(`✅ [${timeStr}] Successfully logged system event: ${eventType}`);
    }
  } catch (err) {
    console.error(`❌ [${timeStr}] Failed to log system event: ${err.message}`);
  }
}
