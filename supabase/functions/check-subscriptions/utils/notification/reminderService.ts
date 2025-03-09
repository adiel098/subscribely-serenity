
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMessenger } from "../telegramMessenger.ts";
import { logNotification } from "../databaseLogger.ts";
import { SubscriptionMember, BotSettings } from "../types.ts";

/**
 * Send the first reminder notification
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
  console.log(`Sending first reminder to ${member.telegram_user_id}, ${daysUntilExpiration} days before expiration`);
  result.action = "first_reminder";
  result.details = `Sent first reminder (${daysUntilExpiration} days before expiration)`;

  const message = botSettings.first_reminder_message + 
    (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');

  // Send first reminder notification
  try {
    let messageSent = false;
    
    if (botSettings.first_reminder_image) {
      console.log(`Attempting to send image message with first reminder to ${member.telegram_user_id}`);
      console.log(`Image URL/data: ${botSettings.first_reminder_image.substring(0, 30)}...`);
      
      // Send photo message with caption
      messageSent = await TelegramMessenger.sendPhotoMessage(
        botToken,
        member.telegram_user_id,
        botSettings.first_reminder_image,
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
      await logSuccessfulNotification(supabase, member, "first_reminder");
      console.log(`✅ First reminder message sent successfully to user ${member.telegram_user_id}`);
    } else {
      console.error(`❌ Failed to send first reminder message`);
      result.details = `Failed to send first reminder`;
    }
  } catch (error) {
    console.error(`❌ Error sending first reminder message to user ${member.telegram_user_id}:`, error);
    result.details = "Failed to send first reminder: " + error.message;
  }
}

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

  const message = botSettings.second_reminder_message + 
    (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');

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

  const message = botSettings.subscription_reminder_message + 
    (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');

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

/**
 * Log a successful notification
 */
export async function logSuccessfulNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  type: string
): Promise<void> {
  // Log the notification in subscription_notifications
  await logNotification(
    supabase,
    member.community_id,
    member.id,
    type
  );

  // Log in activity logs for first and second reminders
  if (type === "first_reminder" || type === "second_reminder") {
    await supabase.from("subscription_activity_logs").insert({
      community_id: member.community_id,
      telegram_user_id: member.telegram_user_id,
      activity_type: `${type}_sent`,
      details: `${type === "first_reminder" ? "First" : "Second"} reminder sent`,
    });
  }
}
