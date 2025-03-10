import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { 
  SubscriptionMember, 
  BotSettings, 
  handleExpiredSubscription, 
  sendReminderNotifications 
} from "./utils/subscriptionManager.ts";

export async function processMember(
  supabase: ReturnType<typeof createClient>, 
  memberData: any, 
  botSettings: BotSettings
): Promise<{ 
  memberId: string;
  telegramUserId: string;
  action: string;
  details: string;
}> {
  // Normalize member data structure to ensure we have an 'id' field
  const member: SubscriptionMember = {
    id: memberData.member_id || memberData.id, // Use member_id if available, fallback to id
    community_id: memberData.community_id,
    telegram_user_id: memberData.telegram_user_id,
    subscription_end_date: memberData.subscription_end_date,
    is_active: memberData.is_active,
    subscription_status: memberData.subscription_status,
    member_id: memberData.member_id // Keep original member_id if present
  };

  console.log("🔍 MEMBER PROCESSOR: Processing member data:", JSON.stringify(member, null, 2));

  // Initialize result object
  const result = {
    memberId: member.id,
    telegramUserId: member.telegram_user_id,
    action: "none",
    details: "",
  };

  // If not active, do nothing
  if (!member.is_active) {
    console.log(`⏭️ MEMBER PROCESSOR: Skipping inactive member ${member.telegram_user_id}`);
    result.action = "skip";
    result.details = "Member is not active";
    return result;
  }

  // If no subscription end date, do nothing
  if (!member.subscription_end_date) {
    console.log(`⏭️ MEMBER PROCESSOR: Skipping member ${member.telegram_user_id} with no subscription end date`);
    result.action = "skip";
    result.details = "No subscription end date";
    return result;
  }

  const now = new Date();
  const subscriptionEndDate = new Date(member.subscription_end_date);
  const msUntilExpiration = subscriptionEndDate.getTime() - now.getTime();
  
  console.log(`📅 MEMBER PROCESSOR: Checking subscription for member ${member.telegram_user_id}`);
  console.log(`   Current time: ${now.toISOString()}`);
  console.log(`   Subscription end: ${subscriptionEndDate.toISOString()}`);
  console.log(`   Time until expiration: ${msUntilExpiration}ms`);
  console.log(`   Current status: ${member.subscription_status}`);

  // Check if subscription has expired
  if (msUntilExpiration <= 0) {
    console.log(`⚠️ EXPIRED: Processing expiration for member ${member.telegram_user_id}`);
    await handleExpiredSubscription(supabase, member, botSettings, result);
    return result;
  }

  // If not expired, handle reminders
  if (member.subscription_status === 'active') {
    const daysUntilExpiration = Math.floor(msUntilExpiration / (1000 * 3600 * 24));
    console.log(`🔔 MEMBER PROCESSOR: Checking reminders - ${daysUntilExpiration} days until expiration`);
    await sendReminderNotifications(supabase, member, botSettings, daysUntilExpiration, result);
  }

  return result;
}
