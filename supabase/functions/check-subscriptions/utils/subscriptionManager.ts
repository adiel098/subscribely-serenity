
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { logNotification, logSystemEvent } from "./databaseLogger.ts";
import { sendTelegramMessage } from "./telegramUtils.ts";
import { BotSettings, SubscriptionMember } from "./types.ts";

// Add this type definition in the types section
export interface SubscriptionMember {
  id: string;
  member_id?: string;
  community_id: string;
  group_id?: string;
  telegram_user_id: string;
  subscription_end_date: string;
  is_active: boolean;
  subscription_status: string;
}

export async function handleExpiredSubscription(
  supabase: ReturnType<typeof createClient>, 
  member: SubscriptionMember, 
  botSettings: BotSettings, 
  result: any
) {
  // Use community_id or group_id based on what's available
  const entityId = member.community_id || member.group_id;
  const entityType = member.community_id ? 'community' : 'group';

  console.log(`⌛ EXPIRED: Handling expired subscription for member ${member.telegram_user_id} in ${entityType} ${entityId}`);

  result.action = "expired";
  result.details = `Handling expired subscription in ${entityType} ${entityId}`;

  // Check if auto-removal is enabled
  if (botSettings.auto_remove_expired) {
    console.log(`🤖 Auto-removal is enabled for ${entityType} ${entityId}`);
    result.details += " - Auto-removal enabled";

    try {
      // Suspend the user in the database
      const { error: updateError } = await supabase
        .from("telegram_chat_members")
        .update({
          is_active: false,
          subscription_status: 'expired'
        })
        .eq("telegram_user_id", member.telegram_user_id)
        .eq("community_id", member.community_id);

      if (updateError) {
        console.error("❌ Error suspending user:", updateError);
        result.action = "error";
        result.details = `Failed to suspend user: ${updateError.message}`;
        return;
      }

      console.log(`✅ Successfully suspended user ${member.telegram_user_id} in database`);
      result.details += " - User suspended in database";

      // Send notification to the user
      if (botSettings.expired_subscription_message) {
        try {
          console.log(`💬 Sending expired subscription message to user ${member.telegram_user_id}`);
          await sendTelegramMessage(
            supabase,
            member.telegram_user_id,
            botSettings.expired_subscription_message,
            botSettings.bot_signature
          );

          console.log(`✅ Successfully sent expired subscription message to user ${member.telegram_user_id}`);
          result.details += " - Expired subscription message sent";

          // Log the notification
          await logNotification(
            supabase,
            member.community_id,
            member.id,
            "subscription_expired"
          );
        } catch (notificationError) {
          console.error(
            `❌ Error sending expired subscription message to user ${member.telegram_user_id}:`,
            notificationError
          );
          result.action = "warning";
          result.details = `Failed to send expired subscription message: ${notificationError.message}`;
        }
      } else {
        console.log(`ℹ️ No expired subscription message configured for ${entityType} ${entityId} - skipping notification`);
        result.details += " - No expired subscription message configured";
      }
    } catch (error) {
      console.error(
        `❌ Error handling expired subscription for user ${member.telegram_user_id}:`,
        error
      );
      result.action = "error";
      result.details = `Failed to handle expired subscription: ${error.message}`;
    }
  } else {
    console.log(`ℹ️ Auto-removal is disabled for ${entityType} ${entityId} - skipping removal`);
    result.details += " - Auto-removal disabled";
  }
}

export async function sendReminderNotifications(
  supabase: ReturnType<typeof createClient>, 
  member: SubscriptionMember, 
  botSettings: BotSettings, 
  daysUntilExpiration: number, 
  result: any
) {
  // Use community_id or group_id based on what's available  
  const entityId = member.community_id || member.group_id;
  const entityType = member.community_id ? 'community' : 'group';

  console.log(`🔔 NOTIFICATION: Checking reminders for member ${member.telegram_user_id} - ${daysUntilExpiration} days until expiration in ${entityType} ${entityId}`);

  // First Reminder
  if (
    daysUntilExpiration === botSettings.first_reminder_days &&
    botSettings.first_reminder_message
  ) {
    try {
      console.log(`💬 Sending FIRST reminder to user ${member.telegram_user_id}`);
      await sendTelegramMessage(
        supabase,
        member.telegram_user_id,
        botSettings.first_reminder_message,
        botSettings.bot_signature
      );

      console.log(`✅ Successfully sent FIRST reminder to user ${member.telegram_user_id}`);
      result.action = "reminder_1";
      result.details = `First reminder sent - ${daysUntilExpiration} days until expiration`;

      // Log the notification
      await logNotification(
        supabase,
        member.community_id,
        member.id,
        "subscription_reminder_1"
      );
    } catch (reminderError) {
      console.error(
        `❌ Error sending FIRST reminder to user ${member.telegram_user_id}:`,
        reminderError
      );
      result.action = "warning";
      result.details = `Failed to send FIRST reminder: ${reminderError.message}`;
    }
  }

  // Second Reminder
  if (
    daysUntilExpiration === botSettings.second_reminder_days &&
    botSettings.second_reminder_message
  ) {
    try {
      console.log(`💬 Sending SECOND reminder to user ${member.telegram_user_id}`);
      await sendTelegramMessage(
        supabase,
        member.telegram_user_id,
        botSettings.second_reminder_message,
        botSettings.bot_signature
      );

      console.log(`✅ Successfully sent SECOND reminder to user ${member.telegram_user_id}`);
      result.action = "reminder_2";
      result.details = `Second reminder sent - ${daysUntilExpiration} days until expiration`;

      // Log the notification
      await logNotification(
        supabase,
        member.community_id,
        member.id,
        "subscription_reminder_2"
      );
    } catch (reminderError) {
      console.error(
        `❌ Error sending SECOND reminder to user ${member.telegram_user_id}:`,
        reminderError
      );
      result.action = "warning";
      result.details = `Failed to send SECOND reminder: ${reminderError.message}`;
    }
  }
}
