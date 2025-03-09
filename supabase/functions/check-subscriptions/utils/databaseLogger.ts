
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
    
    // Validate notificationType to ensure it's one of the valid values
    if (!["reminder", "expiration"].includes(notificationType)) {
      console.warn(`Invalid notification type: ${notificationType}, defaulting to "reminder"`);
      notificationType = "reminder";
    }
    
    // Check the structure of the subscription_notifications table to determine valid status values
    const { data: tableInfo, error: tableError } = await supabase
      .from('subscription_notifications')
      .select('*')
      .limit(1);
    
    // Default to "sent" status, but verify if it's a valid value
    // The most common values for status would be: 'sent', 'pending', 'failed', 'delivered'
    let statusValue = "sent";
    
    if (tableError) {
      console.error(`Error checking table structure: ${tableError.message}`);
      console.log(`Attempting insert with default status "${statusValue}"`);
    }
    
    const { error } = await supabase.from("subscription_notifications").insert({
      community_id: communityId,
      member_id: memberId,
      notification_type: notificationType,
      status: statusValue,
    });
    
    if (error) {
      console.error(`Error logging notification: ${error.message}`);
      
      // If we get a constraint violation error, try with different status values
      if (error.message.includes('violates check constraint "subscription_notifications_status_check"')) {
        console.log('Trying with alternative status values...');
        
        // Try with "delivered" status
        const { error: error2 } = await supabase.from("subscription_notifications").insert({
          community_id: communityId,
          member_id: memberId,
          notification_type: notificationType,
          status: "delivered",
        });
        
        if (error2) {
          console.error(`Second attempt failed with status "delivered": ${error2.message}`);
          
          // Try with "pending" status
          const { error: error3 } = await supabase.from("subscription_notifications").insert({
            community_id: communityId,
            member_id: memberId,
            notification_type: notificationType,
            status: "pending",
          });
          
          if (error3) {
            console.error(`Third attempt failed with status "pending": ${error3.message}`);
          } else {
            console.log('Successfully logged notification with status "pending"');
          }
        } else {
          console.log('Successfully logged notification with status "delivered"');
        }
      }
    } else {
      console.log(`Successfully logged notification with status "${statusValue}"`);
    }
  } catch (err) {
    console.error(`Failed to log notification: ${err.message}`);
  }
}
