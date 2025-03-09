
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMessenger } from "../telegramMessenger.ts";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { logNotification } from "../databaseLogger.ts";
import { formatLegacyReminderMessage } from "./messageFormatter.ts";

/**
 * Send the legacy reminder notification (for backwards compatibility)
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
  console.log(`Sending legacy reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
  result.action = "legacy_reminder";
  result.details = `Sent legacy reminder (${daysUntilExpiration} days before expiration)`;

  const message = formatLegacyReminderMessage(botSettings);

  // Only send if days match the original reminder setting
  try {
    const messageSent = await TelegramMessenger.sendTextMessage(
      botToken,
      member.telegram_user_id,
      message,
      inlineKeyboard
    );

    if (messageSent) {
      // Log the notification only if message was sent successfully
      await logNotification(
        supabase,
        member.community_id,
        member.id,
        "reminder"
      );
      
      console.log(`✅ Legacy reminder message sent successfully to user ${member.telegram_user_id}`);
    } else {
      console.error(`❌ Failed to send legacy reminder message to user ${member.telegram_user_id}`);
      result.details = "Failed to send legacy reminder";
    }
  } catch (error) {
    console.error(`❌ Error sending legacy reminder message to user ${member.telegram_user_id}:`, error);
    result.details = "Failed to send legacy reminder: " + error.message;
  }
}
