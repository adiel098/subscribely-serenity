
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { formatFirstReminderMessage } from "./messageFormatter.ts";
import { logSuccessfulNotification } from "./notificationLogger.ts";
import { sendTelegramMessage } from "../telegramMessenger.ts";

/**
 * Send first reminder to user
 */
export async function sendFirstReminder(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  botToken: string,
  inlineKeyboard: any,
  result: any,
  daysUntilExpiration: number
): Promise<void> {
  try {
    // Format and send the message
    const message = formatFirstReminderMessage(botSettings);
    
    // Send the message with the renew button if available
    await sendTelegramMessage(
      botToken,
      member.telegram_user_id,
      message,
      botSettings.first_reminder_image,
      inlineKeyboard
    );

    // Log the successful notification
    await logSuccessfulNotification(supabase, member, "first_reminder");

    // Update the result object
    result.action = "first_reminder_sent";
    result.details = `First reminder sent (${daysUntilExpiration} days until expiration)`;
    
    console.log(`First reminder sent to user ${member.telegram_user_id}`);
  } catch (error) {
    console.error(`Error sending first reminder to user ${member.telegram_user_id}:`, error);
    result.action = "error";
    result.details = `Error sending first reminder: ${error.message}`;
  }
}
