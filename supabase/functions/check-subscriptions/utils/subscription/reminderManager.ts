
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { 
  sendFirstReminder, 
  sendSecondReminder, 
  sendLegacyReminder 
} from "../notification/reminderService.ts";

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
  if (!member || !member.id || !member.telegram_user_id || !member.community_id) {
    console.error("Invalid member data:", member);
    result.action = "error";
    result.details = "Invalid member data";
    return;
  }

  // First check for recent notification of ANY type to prevent spamming
  if (await hasRecentNotification(supabase, member)) {
    console.log(`User ${member.telegram_user_id} already received a notification today, skipping all reminders`);
    result.action = "skip";
    result.details = "User already received a notification today";
    return;
  }

  // Get bot token and community data once for all reminder types
  const telegramConfig = await getNotificationConfig(supabase, member.community_id);
  if (!telegramConfig) {
    console.error(`Failed to fetch notification configuration for community ${member.community_id}`);
    result.action = "error";
    result.details = "Failed to fetch notification configuration";
    return;
  }

  const { botToken, inlineKeyboard } = telegramConfig;

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
 * Check if user has received any notifications today
 */
async function hasRecentNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember
): Promise<boolean> {
  if (!member || !member.id) {
    console.error("Invalid member data in hasRecentNotification:", member);
    return false;
  }

  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  
  try {
    const { data: recentNotifications, error } = await supabase
      .from("subscription_notifications")
      .select("*")
      .eq("member_id", member.id)
      .gte("sent_at", startOfDay)
      .lt("sent_at", endOfDay);
    
    if (error) {
      console.error("Error checking recent notifications:", error);
      return false;
    }
    
    return !!(recentNotifications && recentNotifications.length > 0);
  } catch (error) {
    console.error("Exception checking recent notifications:", error);
    return false;
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
    const [tokenResult, communityResult] = await Promise.all([
      supabase.from("telegram_global_settings").select("bot_token").single(),
      supabase.from("communities").select("id, miniapp_url, name").eq("id", communityId).single()
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
