
import { logSubscriptionActivity } from "../utils/logger.ts";

/**
 * Handles getting user's subscriptions
 */
export async function handleGetSubscriptions(supabase, requestData) {
  const { telegram_id: telegramId } = requestData;
  console.log(`[telegram-user-manager] Getting subscriptions for telegram ID: ${telegramId}`);
  
  if (!telegramId) {
    console.error(`[telegram-user-manager] Invalid telegram ID provided: ${telegramId}`);
    throw new Error("Telegram ID is required");
  }

  try {
    const { data, error } = await supabase
      .from("telegram_chat_members")
      .select(`
        id,
        telegram_user_id,
        telegram_username,
        joined_at,
        last_active,
        subscription_start_date,
        subscription_end_date,
        subscription_status,
        is_active,
        total_messages,
        community_id,
        community:communities!telegram_chat_members_community_id_fkey(
          id,
          name,
          description,
          telegram_photo_url,
          telegram_invite_link
        ),
        plan:subscription_plans(
          id,
          name,
          description,
          price,
          interval
        )
      `)
      .eq("telegram_user_id", telegramId);

    if (error) {
      console.error(`[telegram-user-manager] Database error fetching subscriptions:`, error);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

    console.log(`[telegram-user-manager] Successfully retrieved ${data?.length || 0} subscriptions`);
    return data || [];
  } catch (err) {
    console.error(`[telegram-user-manager] Error in handleGetSubscriptions:`, err);
    throw err;
  }
}

/**
 * Handles cancelling a subscription
 */
export async function handleCancelSubscription(supabase, requestData) {
  const { subscription_id: subscriptionId } = requestData;
  console.log(`[telegram-user-manager] Cancelling subscription ID: ${subscriptionId}`);
  
  if (!subscriptionId) {
    console.error(`[telegram-user-manager] No subscription ID provided`);
    return { success: false, error: "Subscription ID is required" };
  }

  try {
    const { data, error } = await supabase
      .from("telegram_chat_members")
      .update({
        subscription_status: "removed",
        is_active: false,
      })
      .eq("id", subscriptionId)
      .select();

    if (error) {
      console.error(`[telegram-user-manager] Database error cancelling subscription:`, error);
      return { success: false, error: error.message };
    }

    if (data && data.length > 0) {
      // Log the cancellation
      await logSubscriptionActivity(
        supabase,
        data[0].telegram_user_id,
        data[0].community_id,
        'subscription_cancelled',
        'User cancelled subscription'
      );
    }

    console.log(`[telegram-user-manager] Successfully cancelled subscription: ${subscriptionId}`);
    return { success: true, data };
  } catch (err) {
    console.error(`[telegram-user-manager] Error in handleCancelSubscription:`, err);
    return { success: false, error: err.message };
  }
}
