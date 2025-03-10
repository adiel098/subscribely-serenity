
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
  
  // Calculate exact milliseconds difference
  const msUntilExpiration = subscriptionEndDate.getTime() - now.getTime();
  
  // Convert to days and use Math.floor for more accurate day count (was Math.ceil)
  const daysUntilExpiration = Math.floor(msUntilExpiration / (1000 * 3600 * 24));
  
  // Hours for more detailed logging
  const hoursUntilExpiration = Math.floor(msUntilExpiration / (1000 * 3600));

  // Enhanced logging for expiration checking
  console.log(`📅 MEMBER PROCESSOR: Member ${member.telegram_user_id} subscription expiration info:`);
  console.log(`   Current time: ${now.toISOString()}`);
  console.log(`   Subscription end date: ${subscriptionEndDate.toISOString()}`);
  console.log(`   Time until expiration: ${msUntilExpiration} ms`);
  console.log(`   Days until expiration: ${daysUntilExpiration} days`);
  console.log(`   Hours until expiration: ${hoursUntilExpiration} hours`);
  console.log(`   Current subscription status: ${member.subscription_status}`);
  console.log(`   Has expired? ${msUntilExpiration <= 0 ? 'YES ⚠️' : 'NO ✅'}`);

  // Check if this member has already received notifications today to prevent duplicates
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);
  
  // Instead of checking for any notification today, specifically check for first_reminder or second_reminder
  // This allows both types to be sent on different days
  const specificNotificationType = daysUntilExpiration === botSettings.first_reminder_days 
    ? "first_reminder" 
    : daysUntilExpiration === botSettings.second_reminder_days 
    ? "second_reminder" 
    : null;
  
  if (specificNotificationType) {
    console.log(`🔔 MEMBER PROCESSOR: Checking if ${specificNotificationType} was already sent today to member ${member.telegram_user_id}`);
    const { data: specificRecentNotifications, error: notificationError } = await supabase
      .from('subscription_notifications')
      .select('notification_type')
      .eq('member_id', member.id)
      .eq('notification_type', specificNotificationType)
      .gte('sent_at', todayStart.toISOString())
      .lte('sent_at', todayEnd.toISOString());
    
    if (notificationError) {
      console.error(`❌ MEMBER PROCESSOR: Error checking specific notifications: ${notificationError.message}`);
    } else if (specificRecentNotifications && specificRecentNotifications.length > 0) {
      result.action = "skip";
      result.details = `Already sent ${specificNotificationType} notification today`;
      console.log(`⏭️ MEMBER PROCESSOR: Member ${member.telegram_user_id} already received ${specificNotificationType} notification today - skipping`);
      return result;
    }
  } else {
    // For any other operation (like expiration), check for any notification today
    console.log(`🔔 MEMBER PROCESSOR: Checking if any notification was sent today to member ${member.telegram_user_id}`);
    const { data: recentNotifications, error: notificationError } = await supabase
      .from('subscription_notifications')
      .select('notification_type')
      .eq('member_id', member.id)
      .gte('sent_at', todayStart.toISOString())
      .lte('sent_at', todayEnd.toISOString());
    
    if (notificationError) {
      console.error(`❌ MEMBER PROCESSOR: Error checking recent notifications: ${notificationError.message}`);
    } else if (recentNotifications && recentNotifications.length > 0) {
      result.action = "skip";
      result.details = `Already sent notification today: ${recentNotifications.map(n => n.notification_type).join(', ')}`;
      console.log(`⏭️ MEMBER PROCESSOR: Member ${member.telegram_user_id} already received notification today - skipping`);
      return result;
    }
  }

  // Check if subscription has expired - now comparing timestamps directly instead of days
  if (msUntilExpiration <= 0 && member.subscription_status === 'active') {
    // Subscription has expired
    console.log(`⚠️ EXPIRED: Member ${member.telegram_user_id}'s subscription has expired. Processing expiration...`);
    console.log(`   Expiration details: ${hoursUntilExpiration} hours overdue, status: ${member.subscription_status}`);
    await handleExpiredSubscription(supabase, member, botSettings, result);
    return result;
  }

  // Send reminders if subscription is active and expiration is coming soon
  if (member.subscription_status === 'active') {
    console.log(`🔔 MEMBER PROCESSOR: Checking if reminder should be sent to member ${member.telegram_user_id}`);
    await sendReminderNotifications(supabase, member, botSettings, daysUntilExpiration, result);
  }

  return result;
}
