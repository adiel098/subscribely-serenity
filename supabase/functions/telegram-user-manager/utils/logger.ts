
/**
 * Logs a subscription-related activity
 */
export async function logSubscriptionActivity(
  supabase,
  telegramUserId: string,
  communityId: string,
  activityType: string,
  details: string
) {
  console.log(`[telegram-user-manager] Logging subscription activity: ${activityType} for user ${telegramUserId} in community ${communityId}`);
  try {
    const { error } = await supabase
      .from('subscription_activity_logs')
      .insert({
        telegram_user_id: telegramUserId,
        community_id: communityId,
        activity_type: activityType,
        details
      });
      
    if (error) {
      console.error(`[telegram-user-manager] Error logging subscription activity:`, error);
    } else {
      console.log(`[telegram-user-manager] Successfully logged subscription activity`);
    }
  } catch (err) {
    console.error(`[telegram-user-manager] Error in logSubscriptionActivity:`, err);
  }
}
