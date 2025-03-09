
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMessenger } from "./telegramMessenger.ts";
import { logNotification } from "./databaseLogger.ts";

export interface SubscriptionMember {
  id: string;
  community_id: string;
  telegram_user_id: string;
  subscription_end_date: string | null;
  is_active: boolean;
  subscription_status: string;
}

export interface BotSettings {
  community_id: string;
  auto_remove_expired: boolean;
  expired_subscription_message: string;
  subscription_reminder_days: number;
  subscription_reminder_message: string;
  first_reminder_days: number;
  first_reminder_message: string;
  first_reminder_image: string | null;
  second_reminder_days: number;
  second_reminder_message: string;
  second_reminder_image: string | null;
  bot_signature: string;
}

/**
 * Handles expired subscription members
 */
export async function handleExpiredSubscription(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  result: any
): Promise<void> {
  result.action = "expiration";
  result.details = "Subscription expired";

  // Update member status in database
  await supabase
    .from("telegram_chat_members")
    .update({
      subscription_status: 'expired',
    })
    .eq("id", member.id);

  // Log the expiration in activity logs
  await supabase.from("subscription_activity_logs").insert({
    community_id: member.community_id,
    telegram_user_id: member.telegram_user_id,
    activity_type: "subscription_expired",
    details: "Subscription expired automatically",
  });

  // Send expiration notification to member
  if (botSettings.expired_subscription_message) {
    try {
      // Get global bot token
      const { data: settings } = await supabase
        .from("telegram_global_settings")
        .select("bot_token")
        .single();

      if (!settings?.bot_token) {
        throw new Error('Bot token not found');
      }

      // Get community data for mini app URL
      const { data: community } = await supabase
        .from("communities")
        .select("miniapp_url")
        .eq("id", member.community_id)
        .single();

      // Create inline keyboard if mini app URL is available
      let inlineKeyboard = null;
      if (community?.miniapp_url) {
        inlineKeyboard = {
          inline_keyboard: [
            [
              {
                text: "Renew Now!",
                web_app: {
                  url: `${community.miniapp_url}?start=${member.community_id}`
                }
              }
            ]
          ]
        };
      }

      const message = botSettings.expired_subscription_message + 
        (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');

      // Send message directly via Telegram API
      const messageSent = await TelegramMessenger.sendTextMessage(
        settings.bot_token,
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
          "expiration"
        );
        
        console.log(`✅ Expiration message sent successfully to user ${member.telegram_user_id}`);
      } else {
        console.error(`❌ Failed to send expiration message to user ${member.telegram_user_id}`);
        result.details += ", failed to send notification";
      }
    } catch (error) {
      console.error(`❌ Error sending expiration message to user ${member.telegram_user_id}:`, error);
      result.details += ", failed to send notification: " + error.message;
    }
  }

  // Remove member from chat if auto-remove is enabled
  if (botSettings.auto_remove_expired) {
    try {
      // Get bot token to make direct API call
      const { data: settings } = await supabase
        .from("telegram_global_settings")
        .select("bot_token")
        .single();

      if (!settings?.bot_token) {
        throw new Error('Bot token not found');
      }

      // Make direct API call to kick chat member
      const response = await fetch(
        `https://api.telegram.org/bot${settings.bot_token}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: member.community_id,
            user_id: member.telegram_user_id,
            revoke_messages: false,
          }),
        }
      );

      const kickResult = await response.json();
      if (!kickResult.ok) {
        console.error("Error removing member from chat:", kickResult);
        throw new Error(kickResult.description || "Failed to remove from chat");
      }

      await supabase.from("telegram_chat_members").update({
        is_active: false,
      }).eq("id", member.id);

      result.details += ", removed from chat";
    } catch (error) {
      console.error("Error removing member from chat:", error);
      result.details += ", failed to remove from chat";
    }
  }
}

/**
 * Send reminder notifications based on subscription status
 */
export async function sendReminderNotifications(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  daysUntilExpiration: number,
  result: any
): Promise<void> {
  // First check for recent notification of ANY type to prevent spamming
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  
  const { data: recentNotifications } = await supabase
    .from("subscription_notifications")
    .select("*")
    .eq("member_id", member.id)
    .gte("sent_at", startOfDay)
    .lt("sent_at", endOfDay);
  
  if (recentNotifications && recentNotifications.length > 0) {
    console.log(`User ${member.telegram_user_id} already received a notification today, skipping all reminders`);
    result.action = "skip";
    result.details = "User already received a notification today";
    return;
  }

  // Get bot token and community data once for all reminder types
  const [tokenResult, communityResult] = await Promise.all([
    supabase.from("telegram_global_settings").select("bot_token").single(),
    supabase.from("communities").select("miniapp_url").eq("id", member.community_id).single()
  ]);

  if (tokenResult.error || !tokenResult.data?.bot_token) {
    console.error("Error fetching bot token:", tokenResult.error);
    result.details = "Failed to fetch bot token";
    return;
  }

  const botToken = tokenResult.data.bot_token;
  const miniAppUrl = communityResult.data?.miniapp_url;

  // Create inline keyboard if mini app URL is available
  let inlineKeyboard = null;
  if (miniAppUrl) {
    inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Renew Now!",
            web_app: {
              url: `${miniAppUrl}?start=${member.community_id}`
            }
          }
        ]
      ]
    };
  }

  // First Reminder
  if (daysUntilExpiration === botSettings.first_reminder_days) {
    await sendFirstReminder(
      supabase,
      member,
      botSettings,
      botToken,
      inlineKeyboard,
      result,
      daysUntilExpiration
    );
  }
  // Second Reminder
  else if (daysUntilExpiration === botSettings.second_reminder_days) {
    await sendSecondReminder(
      supabase,
      member,
      botSettings,
      botToken,
      inlineKeyboard,
      result,
      daysUntilExpiration
    );
  }
  // Legacy reminder (for backward compatibility)
  else if (daysUntilExpiration === botSettings.subscription_reminder_days) {
    await sendLegacyReminder(
      supabase,
      member,
      botSettings,
      botToken,
      inlineKeyboard,
      result,
      daysUntilExpiration
    );
  }
}

/**
 * Send the first reminder notification
 */
async function sendFirstReminder(
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
async function sendSecondReminder(
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
async function sendLegacyReminder(
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
async function logSuccessfulNotification(
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
