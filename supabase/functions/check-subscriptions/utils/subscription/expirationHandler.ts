
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

  console.log(`🔍 EXPIRATION HANDLER: Processing expired subscription for user ${member.telegram_user_id} in community ${member.community_id}`);
  console.log(`📋 Member data: ${JSON.stringify(member, null, 2)}`);
  console.log(`⚙️ Bot settings - Auto remove expired: ${botSettings.auto_remove_expired ? 'ENABLED' : 'DISABLED'}`);

  result.action = "expiration";
  result.details = "Subscription expired";

  // Update member status in database
  try {
    console.log(`📝 Updating member status to 'expired' for user ${member.telegram_user_id}`);
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        subscription_status: 'expired',
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error(`❌ Error updating member status: ${updateError.message}`);
      result.details += `, failed to update status: ${updateError.message}`;
    } else {
      console.log(`✅ Successfully updated member status to 'expired'`);
    }
  } catch (error) {
    console.error(`❌ Error updating member status: ${error.message}`);
    result.details += `, failed to update status: ${error.message}`;
  }

  // Log the expiration in activity logs
  try {
    console.log(`📊 Logging expiration in activity logs for user ${member.telegram_user_id}`);
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "subscription_expired",
        details: "Subscription expired automatically",
      });
      
    if (logError) {
      console.error(`❌ Error logging expiration: ${logError.message}`);
      result.details += `, failed to log activity: ${logError.message}`;
    } else {
      console.log(`✅ Successfully logged expiration in activity logs`);
    }
  } catch (error) {
    console.error(`❌ Error logging expiration: ${error.message}`);
    result.details += `, failed to log activity: ${error.message}`;
  }

  // Send expiration notification to member
  if (botSettings.expired_subscription_message) {
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
    console.log(`🚫 Auto-remove is ENABLED - Attempting to remove user ${member.telegram_user_id} from chat`);
    await removeMemberFromChat(supabase, member, result);
  } else {
    console.log(`ℹ️ Auto-remove is DISABLED - User ${member.telegram_user_id} will remain in chat`);
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
      console.error("❌ Invalid member data for removal:", member);
      result.details += ", failed to remove from chat: invalid member data";
      return;
    }

    console.log(`🚫 MEMBER REMOVAL: Starting removal process for user ${member.telegram_user_id} from community ${member.community_id}`);

    // Get bot token to make direct API call
    const { data: settings, error: tokenError } = await supabase
      .from("telegram_global_settings")
      .select("bot_token")
      .single();

    if (tokenError || !settings?.bot_token) {
      console.error(`❌ Failed to get bot token: ${tokenError ? tokenError.message : 'Bot token not found'}`);
      throw new Error(tokenError ? tokenError.message : 'Bot token not found');
    }

    // Get Telegram chat ID for community
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("telegram_chat_id, name")
      .eq("id", member.community_id)
      .single();
      
    if (communityError || !community?.telegram_chat_id) {
      console.error(`❌ Failed to get chat ID: ${communityError ? communityError.message : 'Telegram chat ID not found'}`);
      throw new Error(communityError ? communityError.message : 'Telegram chat ID not found');
    }

    console.log(`🔄 Removing user ${member.telegram_user_id} from chat ${community.telegram_chat_id} (${community.name || member.community_id})`);

    // Make direct API call to kick chat member
    console.log(`📤 Sending API request to ban user ${member.telegram_user_id} from chat ${community.telegram_chat_id}`);
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
      console.error(`❌ HTTP error ${response.status}: ${errorText}`);
      throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }

    const kickResult = await response.json();
    console.log(`📥 Ban API response: ${JSON.stringify(kickResult, null, 2)}`);
    
    if (!kickResult.ok) {
      console.error("❌ Error removing member from chat:", kickResult);
      throw new Error(kickResult.description || "Failed to remove from chat");
    }

    console.log(`✅ User ${member.telegram_user_id} successfully banned from chat ${community.telegram_chat_id}`);

    // Update member status in database
    console.log(`📝 Updating member status in database to inactive`);
    const { error: updateError } = await supabase
      .from("telegram_chat_members")
      .update({
        is_active: false,
      })
      .eq("id", member.id);
      
    if (updateError) {
      console.error("❌ Error updating member status after removal:", updateError);
      result.details += ", removed from chat but failed to update status";
    } else {
      console.log(`✅ Successfully updated member status to inactive in database`);
      result.details += ", removed from chat";
    }

    // Log the removal in activity log
    console.log(`📊 Logging member removal in activity logs`);
    const { error: logError } = await supabase
      .from("subscription_activity_logs")
      .insert({
        community_id: member.community_id,
        telegram_user_id: member.telegram_user_id,
        activity_type: "member_removed",
        details: "Member removed automatically due to expired subscription"
      });
      
    if (logError) {
      console.error("❌ Error logging member removal:", logError);
    } else {
      console.log(`✅ Successfully logged member removal in activity logs`);
    }
  } catch (error) {
    console.error("❌ Error removing member from chat:", error);
    result.details += ", failed to remove from chat: " + error.message;
  }
}
