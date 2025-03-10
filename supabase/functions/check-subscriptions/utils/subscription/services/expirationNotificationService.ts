
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../../types.ts";

const DEFAULT_MINI_APP_URL = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";

/**
 * Sends expiration notification to member
 */
export async function sendExpirationNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  result: any
): Promise<boolean> {
  try {
    console.log(`🔔 Sending expiration notification to user ${member.telegram_user_id}`);

    // Get bot token and community data for notification
    const telegramConfig = await getExpirationNotificationConfig(supabase, member.community_id);
    if (!telegramConfig) {
      console.error(`❌ Failed to get notification config for community ${member.community_id}`);
      result.details += ", failed to get notification config";
      return false;
    }

    const { botToken, inlineKeyboard } = telegramConfig;

    // Send the expiration message with renewal button
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: member.telegram_user_id,
          text: botSettings.expired_subscription_message || "Your subscription has expired.",
          parse_mode: "Markdown",
          reply_markup: inlineKeyboard
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP error ${response.status}: ${errorText}`);
      result.details += `, failed to send notification: ${errorText}`;
      return false;
    }

    const responseData = await response.json();
    
    if (!responseData.ok) {
      console.error(`❌ Error sending expiration notification: ${responseData.description}`);
      result.details += `, failed to send notification: ${responseData.description}`;
      return false;
    }

    // Log the notification in the database
    await logExpirationNotification(supabase, member, result);

    console.log(`✅ Successfully sent expiration notification to user ${member.telegram_user_id}`);
    result.details += ", expiration notification sent";
    return true;
  } catch (error) {
    console.error(`❌ Error in sendExpirationNotification: ${error.message}`);
    result.details += `, failed to send notification: ${error.message}`;
    return false;
  }
}

/**
 * Get notification configuration for expiration messages
 */
async function getExpirationNotificationConfig(
  supabase: ReturnType<typeof createClient>,
  communityId: string
): Promise<{ botToken: string; inlineKeyboard: any } | null> {
  try {
    console.log(`📝 Fetching notification config for community ${communityId}`);
    
    const [tokenResult, communityResult] = await Promise.all([
      supabase.from("telegram_global_settings").select("bot_token").single(),
      supabase.from("communities").select("id, miniapp_url").eq("id", communityId).single()
    ]);

    if (tokenResult.error || !tokenResult.data?.bot_token) {
      console.error(`❌ Error fetching bot token: ${tokenResult.error?.message}`);
      return null;
    }

    const botToken = tokenResult.data.bot_token;
    
    // Use community miniapp URL or default URL
    let miniAppUrl = communityResult.data?.miniapp_url || DEFAULT_MINI_APP_URL;
    
    // Create renewal button for message
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Renew Subscription 🔄",
            web_app: {
              url: `${miniAppUrl}?start=${communityId}`
            }
          }
        ]
      ]
    };

    return { botToken, inlineKeyboard };
  } catch (error) {
    console.error(`❌ Error in getExpirationNotificationConfig: ${error.message}`);
    return null;
  }
}

/**
 * Log expiration notification in the database
 */
async function logExpirationNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  result: any
): Promise<void> {
  try {
    console.log(`📝 Logging expiration notification for user ${member.telegram_user_id}`);
    
    const { error } = await supabase
      .from("subscription_notifications")
      .insert({
        community_id: member.community_id,
        member_id: member.id,
        notification_type: "expiration",
        status: "success"
      });
      
    if (error) {
      console.error(`❌ Error logging expiration notification: ${error.message}`);
      result.details += `, failed to log notification: ${error.message}`;
    } else {
      console.log(`✅ Successfully logged expiration notification`);
    }
  } catch (error) {
    console.error(`❌ Error in logExpirationNotification: ${error.message}`);
    result.details += `, failed to log notification: ${error.message}`;
  }
}
