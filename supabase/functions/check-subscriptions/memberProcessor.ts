
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { 
  SubscriptionMember, 
  BotSettings, 
  handleExpiredSubscription, 
  sendReminderNotifications 
} from "./utils/subscriptionManager.ts";

/**
 * Process a member's subscription status and send appropriate notifications
 */
export async function processMember(
  supabase: ReturnType<typeof createClient>, 
  member: SubscriptionMember, 
  botSettings: BotSettings
): Promise<{ 
  memberId: string;
  telegramUserId: string;
  action: string;
  details: string;
}> {
  // Initialize result object
  const result = {
    memberId: member.id,
    telegramUserId: member.telegram_user_id,
    action: "none",
    details: "",
  };

  // If not active, do nothing
  if (!member.is_active) {
    result.action = "skip";
    result.details = "Member is not active";
    return result;
  }

  // If no subscription end date, do nothing
  if (!member.subscription_end_date) {
    result.action = "skip";
    result.details = "No subscription end date";
    return result;
  }

  const now = new Date();
  const subscriptionEndDate = new Date(member.subscription_end_date);
  const daysUntilExpiration = Math.ceil(
    (subscriptionEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
  );

  // Log for debugging
  console.log(`Member ${member.telegram_user_id} has ${daysUntilExpiration} days until expiration`);

  // Check if subscription has expired
  if (daysUntilExpiration <= 0 && member.subscription_status === 'active') {
    // Subscription has expired
    await handleExpiredSubscription(supabase, member, botSettings, result);
    return result;
  }

  // Send reminders if subscription is active and expiration is coming soon
  if (member.subscription_status === 'active') {
    await sendReminderNotifications(supabase, member, botSettings, daysUntilExpiration, result);
  }

  return result;
}
