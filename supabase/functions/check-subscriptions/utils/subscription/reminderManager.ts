
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";

const DEFAULT_MINI_APP_URL = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";

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
  // Validate member data
  if (!member || !member.telegram_user_id || !member.community_id) {
    console.error("Invalid member data in sendReminderNotifications:", JSON.stringify(member, null, 2));
    result.action = "error";
    result.details = "Invalid member data";
    return;
  }

  const memberId = member.id || member.member_id;
  if (!memberId) {
    console.error("Missing member ID in sendReminderNotifications:", JSON.stringify(member, null, 2));
    result.action = "error";
    result.details = "Missing member ID";
    return;
  }

  console.log(`Processing reminder for member ${memberId} (${member.telegram_user_id}), ${daysUntilExpiration} days until expiration`);

  // Get bot token and community data once for all reminder types
  const telegramConfig = await getNotificationConfig(supabase, member.community_id);
  if (!telegramConfig) {
    console.error(`Failed to fetch notification configuration for community ${member.community_id}`);
    result.action = "error";
    result.details = "Failed to fetch notification configuration";
    return;
  }

  const { botToken, inlineKeyboard } = telegramConfig;

  // Debug info
  console.log(`First reminder days: ${botSettings.first_reminder_days}, Second reminder days: ${botSettings.second_reminder_days}, Legacy reminder days: ${botSettings.subscription_reminder_days}`);
  console.log(`Current days until expiration: ${daysUntilExpiration}`);

  // First Reminder
  if (daysUntilExpiration === botSettings.first_reminder_days) {
    console.log(`Sending first reminder (${daysUntilExpiration} days until expiration)`);
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
    console.log(`Sending second reminder (${daysUntilExpiration} days until expiration)`);
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
    console.log(`Sending legacy reminder (${daysUntilExpiration} days until expiration)`);
    await sendLegacyReminder(
      supabase,
      member,
      botSettings,
      botToken,
      inlineKeyboard,
      result,
      daysUntilExpiration
    );
  } else {
    console.log(`No reminder needed for ${daysUntilExpiration} days until expiration`);
    result.action = "no_reminder_needed";
    result.details = `No reminder configured for ${daysUntilExpiration} days until expiration`;
  }
}

/**
 * Get notification configuration (bot token and inline keyboard)
 */
async function getNotificationConfig(
  supabase: ReturnType<typeof createClient>,
  communityId: string
): Promise<{ botToken: string; inlineKeyboard: any } | null> {
  try {
    console.log(`Fetching notification configuration for community ${communityId}`);
    
    const [tokenResult, communityResult] = await Promise.all([
      supabase.from("telegram_global_settings").select("bot_token").single(),
      supabase.from("communities").select("id, miniapp_url, name, telegram_photo_url").eq("id", communityId).single()
    ]);

    if (tokenResult.error || !tokenResult.data?.bot_token) {
      console.error("Error fetching bot token:", tokenResult.error);
      return null;
    }

    const botToken = tokenResult.data.bot_token;
    
    // Use the community miniapp_url or fall back to the default URL
    let miniAppUrl = communityResult.data?.miniapp_url;
    
    if (!miniAppUrl) {
      console.warn(`No miniapp_url found for community ${communityId}, using default URL`);
      
      // Update the community with the default miniapp_url
      try {
        const { error: updateError } = await supabase
          .from("communities")
          .update({ miniapp_url: DEFAULT_MINI_APP_URL })
          .eq("id", communityId);
        
        if (updateError) {
          console.error("Error updating community miniapp_url:", updateError);
        } else {
          console.log(`Updated community ${communityId} with default miniapp_url`);
        }
      } catch (updateError) {
        console.error("Exception updating community miniapp_url:", updateError);
      }
      
      miniAppUrl = DEFAULT_MINI_APP_URL;
    }
    
    console.log(`Creating renew button with miniAppUrl: ${miniAppUrl} for community: ${communityResult.data?.name || communityId}`);
    
    // Always create inline keyboard with the available URL
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Renew Now! 🔄",
            web_app: {
              url: `${miniAppUrl}?start=${communityId}`
            }
          }
        ]
      ]
    };

    return { botToken, inlineKeyboard };
  } catch (error) {
    console.error("Error getting notification config:", error);
    return null;
  }
}

/**
 * Send first reminder notification
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
  try {
    console.log(`🔔 Sending FIRST reminder to user ${member.telegram_user_id}, ${daysUntilExpiration} days until expiration`);
    
    // Get or create message based on settings
    const message = formatFirstReminderMessage(botSettings, daysUntilExpiration);
    
    // Send the message with the button
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: member.telegram_user_id,
          text: message,
          parse_mode: "Markdown",
          reply_markup: inlineKeyboard
        }),
      }
    );

    const responseData = await response.json();
    console.log(`📤 First reminder API response:`, JSON.stringify(responseData, null, 2));

    if (!responseData.ok) {
      console.error(`❌ Error sending first reminder: ${responseData.description}`);
      result.action = "reminder_error";
      result.details = `Error sending first reminder: ${responseData.description}`;
      return;
    }

    // Log the notification in the database
    await logReminderNotification(supabase, member, "first_reminder", result);

    result.action = "first_reminder_sent";
    result.details = `First reminder sent (${daysUntilExpiration} days until expiration)`;
    console.log(`✅ First reminder successfully sent to user ${member.telegram_user_id}`);
  } catch (error) {
    console.error(`❌ Error in sendFirstReminder:`, error);
    result.action = "reminder_error";
    result.details = `Error in first reminder: ${error.message}`;
  }
}

/**
 * Send second reminder notification
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
  try {
    console.log(`🔔 Sending SECOND reminder to user ${member.telegram_user_id}, ${daysUntilExpiration} days until expiration`);
    
    // Get or create message based on settings
    const message = formatSecondReminderMessage(botSettings, daysUntilExpiration);
    
    // Send the message with the button
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: member.telegram_user_id,
          text: message,
          parse_mode: "Markdown",
          reply_markup: inlineKeyboard
        }),
      }
    );

    const responseData = await response.json();
    console.log(`📤 Second reminder API response:`, JSON.stringify(responseData, null, 2));

    if (!responseData.ok) {
      console.error(`❌ Error sending second reminder: ${responseData.description}`);
      result.action = "reminder_error";
      result.details = `Error sending second reminder: ${responseData.description}`;
      return;
    }

    // Log the notification in the database
    await logReminderNotification(supabase, member, "second_reminder", result);

    result.action = "second_reminder_sent";
    result.details = `Second reminder sent (${daysUntilExpiration} days until expiration)`;
    console.log(`✅ Second reminder successfully sent to user ${member.telegram_user_id}`);
  } catch (error) {
    console.error(`❌ Error in sendSecondReminder:`, error);
    result.action = "reminder_error";
    result.details = `Error in second reminder: ${error.message}`;
  }
}

/**
 * Send legacy reminder notification
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
  try {
    console.log(`🔔 Sending LEGACY reminder to user ${member.telegram_user_id}, ${daysUntilExpiration} days until expiration`);
    
    // Get or create message based on settings
    const message = formatLegacyReminderMessage(botSettings, daysUntilExpiration);
    
    // Send the message with the button
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: member.telegram_user_id,
          text: message,
          parse_mode: "Markdown",
          reply_markup: inlineKeyboard
        }),
      }
    );

    const responseData = await response.json();
    console.log(`📤 Legacy reminder API response:`, JSON.stringify(responseData, null, 2));

    if (!responseData.ok) {
      console.error(`❌ Error sending legacy reminder: ${responseData.description}`);
      result.action = "reminder_error";
      result.details = `Error sending legacy reminder: ${responseData.description}`;
      return;
    }

    // Log the notification in the database
    await logReminderNotification(supabase, member, "subscription_reminder", result);

    result.action = "legacy_reminder_sent";
    result.details = `Legacy reminder sent (${daysUntilExpiration} days until expiration)`;
    console.log(`✅ Legacy reminder successfully sent to user ${member.telegram_user_id}`);
  } catch (error) {
    console.error(`❌ Error in sendLegacyReminder:`, error);
    result.action = "reminder_error";
    result.details = `Error in legacy reminder: ${error.message}`;
  }
}

/**
 * Format the message for the first reminder
 */
function formatFirstReminderMessage(botSettings: BotSettings, daysUntilExpiration: number): string {
  // Use the specific message or fallback to legacy message
  const message = botSettings.first_reminder_message || botSettings.subscription_reminder_message;
  
  // Replace placeholders if present
  return message.replace("{{days}}", daysUntilExpiration.toString());
}

/**
 * Format the message for the second reminder
 */
function formatSecondReminderMessage(botSettings: BotSettings, daysUntilExpiration: number): string {
  // Use the specific message or fallback to legacy message
  const message = botSettings.second_reminder_message || botSettings.subscription_reminder_message;
  
  // Replace placeholders if present
  return message.replace("{{days}}", daysUntilExpiration.toString());
}

/**
 * Format the message for the legacy reminder
 */
function formatLegacyReminderMessage(botSettings: BotSettings, daysUntilExpiration: number): string {
  // Use legacy reminder message
  return botSettings.subscription_reminder_message.replace("{{days}}", daysUntilExpiration.toString());
}

/**
 * Log the reminder notification to the database
 */
async function logReminderNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  notificationType: string,
  result: any
): Promise<void> {
  try {
    console.log(`📝 Logging ${notificationType} notification for user ${member.telegram_user_id}`);
    
    const { error } = await supabase
      .from("subscription_notifications")
      .insert({
        community_id: member.community_id,
        member_id: member.id || member.member_id,
        notification_type: notificationType,
        status: "success"
      });
      
    if (error) {
      console.error(`❌ Error logging notification: ${error.message}`);
      result.details += `, failed to log notification: ${error.message}`;
    } else {
      console.log(`✅ Successfully logged ${notificationType} notification`);
    }
  } catch (error) {
    console.error(`❌ Error in logReminderNotification:`, error);
    result.details += `, failed to log notification: ${error.message}`;
  }
}
