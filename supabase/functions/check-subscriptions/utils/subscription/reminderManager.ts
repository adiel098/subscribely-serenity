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

  // Check if this specific reminder type has been sent recently
  // We'll check this in the memberProcessor.ts now to allow different reminder types
  // to be sent when appropriate

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
 * Check if user has received any notifications today
 */
async function hasRecentNotification(
  supabase: ReturnType<typeof createClient>,
  member: SubscriptionMember
): Promise<boolean> {
  if (!member) {
    console.error("Invalid member data in hasRecentNotification");
    return false;
  }
  
  const memberId = member.id || member.member_id;
  if (!memberId) {
    console.error("Missing member ID in hasRecentNotification:", JSON.stringify(member, null, 2));
    return false;
  }

  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(new Date().setHours(23, 59, 59, 999)).toISOString();
  
  try {
    console.log(`Checking for recent notifications for member ${memberId} between ${startOfDay} and ${endOfDay}`);
    
    const { data: recentNotifications, error } = await supabase
      .from("subscription_notifications")
      .select("*")
      .eq("member_id", memberId)
      .gte("sent_at", startOfDay)
      .lt("sent_at", endOfDay);
    
    if (error) {
      console.error("Error checking recent notifications:", error);
      return false;
    }
    
    const hasNotifications = !!(recentNotifications && recentNotifications.length > 0);
    console.log(`Member ${memberId} has ${hasNotifications ? recentNotifications.length : 'no'} recent notifications`);
    
    return hasNotifications;
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
    console.log(`Fetching notification configuration for community ${communityId}`);
    
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
