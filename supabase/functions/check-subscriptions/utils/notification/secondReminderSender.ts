
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMessenger } from "../telegramMessenger.ts";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { logSuccessfulNotification } from "./notificationLogger.ts";
import { formatSecondReminderMessage } from "./messageFormatter.ts";

/**
 * Send the second reminder notification
 */
export async function sendSecondReminder(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  botToken: string,
  inlineKeyboard: any,
  result: any,
  daysUntilExpiration: number
): Promise<void> {
  console.log(`Sending second reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
  result.action = "second_reminder";
  result.details = `Sent second reminder (${daysUntilExpiration} days before expiration)`;

  const message = formatSecondReminderMessage(botSettings);

  // Send second reminder notification
  try {
    let messageSent = false;
    
    if (botSettings.second_reminder_image) {
      console.log(`Attempting to send image message with second reminder to ${member.telegram_user_id}`);
      console.log(`Image URL/data: ${botSettings.second_reminder_image.substring(0, 30)}...`);
      
      // Send photo message with caption
      messageSent = await TelegramMessenger.sendPhotoMessage(
        botToken,
        member.telegram_user_id,
        botSettings.second_reminder_image,
        message,
        inlineKeyboard
      );
      
      if (!messageSent) {
        console.log(`Failed to send image message, falling back to text for user ${member.telegram_user_id}`);
        // If image sending fails, fall back to text message
        messageSent = await TelegramMessenger.sendTextMessage(
          botToken,
          member.telegram_user_id,
          message,
          inlineKeyboard
        );
      }
    } else {
      // Send text message
      messageSent = await TelegramMessenger.sendTextMessage(
        botToken,
        member.telegram_user_id,
        message,
        inlineKeyboard
      );
    }

    if (messageSent) {
      await logSuccessfulNotification(supabase, member, "second_reminder");
      console.log(`✅ Second reminder message sent successfully to user ${member.telegram_user_id}`);
    } else {
      console.error(`❌ Failed to send second reminder message`);
      result.details = `Failed to send second reminder`;
    }
  } catch (error) {
    console.error(`❌ Error sending second reminder message to user ${member.telegram_user_id}:`, error);
    result.details = "Failed to send second reminder: " + error.message;
  }
}
