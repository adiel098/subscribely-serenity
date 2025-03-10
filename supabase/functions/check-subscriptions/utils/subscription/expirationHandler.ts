
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMessenger } from "../telegramMessenger.ts";
import { logNotification } from "../databaseLogger.ts";
import { SubscriptionMember, BotSettings } from "../types.ts";

const DEFAULT_MINI_APP_URL = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";

/**
 * Handles expired subscription members
 */
export async function handleExpiredSubscription(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  botSettings: BotSettings,
  result: any
): Promise<void> {
  if (!member || !member.id || !member.telegram_user_id || !member.community_id) {
    console.error("Invalid member data:", member);
    result.action = "error";
    result.details = "Invalid member data";
    return;
  }

  result.action = "expiration";
  result.details = "Subscription expired";

  // Update member status in database
  try {
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        subscription_status: 'expired',
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error(`Error updating member status: ${updateError.message}`);
      result.details += `, failed to update status: ${updateError.message}`;
    }
  } catch (error) {
    console.error(`Error updating member status: ${error.message}`);
    result.details += `, failed to update status: ${error.message}`;
  }

  // Log the expiration in activity logs
  try {
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "subscription_expired",
        details: "Subscription expired automatically",
      });
      
    if (logError) {
      console.error(`Error logging expiration: ${logError.message}`);
      result.details += `, failed to log activity: ${logError.message}`;
    }
  } catch (error) {
    console.error(`Error logging expiration: ${error.message}`);
    result.details += `, failed to log activity: ${error.message}`;
  }

  // Send expiration notification to member
  if (botSettings.expired_subscription_message) {
    try {
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
        console.warn(`Warning fetching community: ${communityError.message}`);
      }

      // Use the community miniapp_url or fall back to the default URL
      let miniAppUrl = community?.miniapp_url;
      
      if (!miniAppUrl) {
        console.warn(`No miniapp_url found for community ${member.community_id}, using default URL`);
        
        // Update the community with the default miniapp_url
        try {
          const { error: updateError } = await supabase
            .from("communities")
            .update({ miniapp_url: DEFAULT_MINI_APP_URL })
            .eq("id", member.community_id);
          
          if (updateError) {
            console.error("Error updating community miniapp_url:", updateError);
          } else {
            console.log(`Updated community ${member.community_id} with default miniapp_url`);
          }
        } catch (updateError) {
          console.error("Error updating community miniapp_url:", updateError);
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

      console.log(`Sending expiration message to user ${member.telegram_user_id} for community ${community?.name || member.community_id}`);
      console.log(`Using miniAppUrl: ${miniAppUrl}`);

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
        } catch (error) {
          console.error(`❌ Error logging notification: ${error.message}`);
        }
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
    await removeMemberFromChat(supabase, member, result);
  }
}

/**
 * Removes a member from the chat
 */
async function removeMemberFromChat(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember,
  result: any
): Promise<void> {
  try {
    if (!member || !member.telegram_user_id || !member.community_id) {
      console.error("Invalid member data for removal:", member);
      result.details += ", failed to remove from chat: invalid member data";
      return;
    }

    // Get bot token to make direct API call
    const { data: settings, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !settings?.bot_token) {
      throw new Error(tokenError ? tokenError.message : 'Bot token not found');
    }

    // Get Telegram chat ID for community
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("telegram_chat_id, name")
      .eq("id", member.community_id)
      .single();
      
    if (communityError || !community?.telegram_chat_id) {
      throw new Error(communityError ? communityError.message : 'Telegram chat ID not found');
    }

    console.log(`Removing user ${member.telegram_user_id} from chat ${community.telegram_chat_id} (${community.name || member.community_id})`);

    // Make direct API call to kick chat member
    const response = await fetch(
      `https://api.telegram.org/bot${settings.bot_token}/banChatMember`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: community.telegram_chat_id,
          user_id: member.telegram_user_id,
          revoke_messages: false,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error ${response.status}: ${errorText}`);
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const kickResult = await response.json();
    if (!kickResult.ok) {
      console.error("Error removing member from chat:", kickResult);
      throw new Error(kickResult.description || "Failed to remove from chat");
    }

    // Update member status in database
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        is_active: false,
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error("Error updating member status after removal:", updateError);
      result.details += ", removed from chat but failed to update status";
    } else {
      result.details += ", removed from chat";
    }

    // Log the removal in activity log
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "member_removed",
        details: "Member removed automatically due to expired subscription"
      });
      
    if (logError) {
      console.error("Error logging member removal:", logError);
    }
  } catch (error) {
    console.error("Error removing member from chat:", error);
    result.details += ", failed to remove from chat: " + error.message;
  }
}
