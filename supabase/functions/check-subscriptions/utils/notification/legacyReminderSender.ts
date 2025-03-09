
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { formatLegacyReminderMessage } from "./messageFormatter.ts";
import { logSuccessfulNotification } from "./notificationLogger.ts";
import { sendTelegramMessage } from "../telegramMessenger.ts";

/**
 * Send legacy reminder to user
 * This is kept for backward compatibility
 */
export async function sendLegacyReminder(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  botToken: string,
  inlineKeyboard: any,
  result: any,
  daysUntilExpiration: number
): Promise<void> {
  try {
    // Format the message
    const message = formatLegacyReminderMessage(botSettings);
    
    console.log(`Sending legacy reminder to user ${member.telegram_user_id}`);
    
    if (inlineKeyboard) {
      console.log("Including Renew Now button with message");
    } else {
      console.log("No Renew Now button available (missing miniapp_url)");
    }
    
    // Send the message with the renew button if available
    const success = await sendTelegramMessage(
      botToken,
      member.telegram_user_id,
      message,
      null, // Legacy reminders don't have images
      inlineKeyboard
    );

    if (!success) {
      throw new Error("Failed to send telegram message");
    }

    // Log the successful notification
    await logSuccessfulNotification(supabase, member, "subscription_reminder");

    // Update the result object
    result.action = "reminder_sent";
    result.details = `Subscription reminder sent (${daysUntilExpiration} days until expiration)`;
    
    console.log(`Legacy reminder sent to user ${member.telegram_user_id}`);
  } catch (error) {
    console.error(`Error sending legacy reminder to user ${member.telegram_user_id}:`, error);
    result.action = "error";
    result.details = `Error sending legacy reminder: ${error.message}`;
  }
}
