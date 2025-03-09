
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { SubscriptionMember, BotSettings } from "../types.ts";
import { sendFirstReminder, sendSecondReminder, sendLegacyReminder } from "../notification/reminderService.ts";

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
  if (await hasRecentNotification(supabase, member)) {
    console.log(`User ${member.telegram_user_id} already received a notification today, skipping all reminders`);
    result.action = "skip";
    result.details = "User already received a notification today";
    return;
  }

  // Get bot token and community data once for all reminder types
  const telegramConfig = await getNotificationConfig(supabase, member.community_id);
  if (!telegramConfig) {
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
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  
  const { data: recentNotifications } = await supabase
    .from("subscription_notifications")
    .select("*")
    .eq("member_id", member.id)
    .gte("sent_at", startOfDay)
    .lt("sent_at", endOfDay);
  
  return !!(recentNotifications && recentNotifications.length > 0);
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
      supabase.from("communities").select("miniapp_url").eq("id", communityId).single()
    ]);

    if (tokenResult.error || !tokenResult.data?.bot_token) {
      console.error("Error fetching bot token:", tokenResult.error);
      return null;
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
                url: `${miniAppUrl}?start=${communityId}`
              }
            }
          ]
        ]
      };
    }

    return { botToken, inlineKeyboard };
  } catch (error) {
    console.error("Error getting notification config:", error);
    return null;
  }
}
