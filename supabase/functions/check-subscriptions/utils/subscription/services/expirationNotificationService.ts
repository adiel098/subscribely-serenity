
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMessenger } from "../../telegramMessenger.ts";
import { logNotification } from "../../databaseLogger.ts";
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
  if (!botSettings.expired_subscription_message) {
    console.log(`⚠️ No expiration message configured for community ${member.community_id}`);
    return false;
  }
  
  try {
    console.log(`💌 Preparing to send expiration notification to user ${member.telegram_user_id}`);
    
    // Get global bot token
    const { data: settings, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !settings?.bot_token) {
      throw new Error(tokenError ? tokenError.message : 'Bot token not found');
    }

    // Get community data for mini app URL
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("miniapp_url, name, telegram_photo_url")
      .eq("id", member.community_id)
      .single();

    if (communityError) {
      console.warn(`⚠️ Warning fetching community: ${communityError.message}`);
    }

    // Use the community miniapp_url or fall back to the default URL
    let miniAppUrl = community?.miniapp_url;
    
    if (!miniAppUrl) {
      console.warn(`⚠️ No miniapp_url found for community ${member.community_id}, using default URL`);
      
      // Update the community with the default miniapp_url
      try {
        const { error: updateError } = await supabase
          .from("communities")
          .update({ miniapp_url: DEFAULT_MINI_APP_URL })
          .eq("id", member.community_id);
        
        if (updateError) {
          console.error("❌ Error updating community miniapp_url:", updateError);
        } else {
          console.log(`✅ Updated community ${member.community_id} with default miniapp_url`);
        }
      } catch (updateError) {
        console.error("❌ Error updating community miniapp_url:", updateError);
      }
      
      miniAppUrl = DEFAULT_MINI_APP_URL;
    }

    // Create inline keyboard with the renewed URL
    const inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: "Renew Now! 🔄",
            web_app: {
              url: `${miniAppUrl}?start=${member.community_id}`
            }
          }
        ]
      ]
    };

    const message = botSettings.expired_subscription_message + 
      (botSettings.bot_signature ? `\n\n${botSettings.bot_signature}` : '');

    console.log(`📱 Sending expiration message to user ${member.telegram_user_id} for community ${community?.name || member.community_id}`);
    console.log(`🔗 Using miniAppUrl: ${miniAppUrl}`);

    // Send message directly via Telegram API
    const messageSent = await TelegramMessenger.sendTextMessage(
      settings.bot_token,
      member.telegram_user_id,
      message,
      inlineKeyboard
    );

    if (messageSent) {
      // Log the notification only if message was sent successfully
      try {
        await logNotification(
          supabase,
          member.community_id,
          member.id,
          "expiration"
        );
        
        console.log(`✅ Expiration message sent successfully to user ${member.telegram_user_id}`);
        return true;
      } catch (error) {
        console.error(`❌ Error logging notification: ${error.message}`);
        return false;
      }
    } else {
      console.error(`❌ Failed to send expiration message to user ${member.telegram_user_id}`);
      result.details += ", failed to send notification";
      return false;
    }
  } catch (error) {
    console.error(`❌ Error sending expiration message to user ${member.telegram_user_id}:`, error);
    result.details += ", failed to send notification: " + error.message;
    return false;
  }
}
