
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { TelegramMessenger } from "../telegramMessenger.ts";
import { logNotification } from "../databaseLogger.ts";
import { SubscriptionMember, BotSettings } from "../types.ts";

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
