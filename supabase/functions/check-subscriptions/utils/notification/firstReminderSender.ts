
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
    // Validate member data
    if (!member || !member.telegram_user_id) {
      console.error("Invalid member data:", JSON.stringify(member, null, 2));
      throw new Error("Invalid member data");
    }

    const memberId = member.id || member.member_id;
    if (!memberId) {
      console.error("Missing member ID:", JSON.stringify(member, null, 2));
      throw new Error("Missing member ID");
    }

    // Format the message
    const message = formatFirstReminderMessage(botSettings);
    
    console.log(`Sending first reminder to user ${member.telegram_user_id} with member ID ${memberId}`);
    
    if (inlineKeyboard) {
      console.log("Including Renew Now button with message");
      console.log("Button data:", JSON.stringify(inlineKeyboard));
    } else {
      console.log("No Renew Now button available - creating default one");
      
      // Create a default inline keyboard if none is provided
      inlineKeyboard = {
        inline_keyboard: [
          [
            {
              text: "Renew Now! 🔄",
              url: "https://t.me/membifybot"
            }
          ]
        ]
      };
    }
    
    // Send the message with the renew button if available
    const success = await sendTelegramMessage(
      botToken,
      member.telegram_user_id,
      message,
      botSettings.first_reminder_image,
      inlineKeyboard
    );

    if (!success) {
      throw new Error("Failed to send telegram message");
    }

    // Log the successful notification
    await logSuccessfulNotification(supabase, member, "first_reminder");

    // Update the result object
    result.action = "first_reminder_sent";
    result.details = `First reminder sent (${daysUntilExpiration} days until expiration)`;
    
    console.log(`First reminder sent to user ${member.telegram_user_id}`);
  } catch (error) {
    console.error(`Error sending first reminder to user ${member?.telegram_user_id || 'unknown'}:`, error);
    result.action = "error";
    result.details = `Error sending first reminder: ${error.message}`;
  }
}
