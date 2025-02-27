
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "./types/memberTypes";

/**
 * Fetches user subscriptions from the backend
 * @param userId Telegram user ID
 * @returns Array of user subscriptions
 */
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  console.log("Fetching subscriptions for user ID:", userId);

  if (!userId) {
    console.error("getUserSubscriptions: No user ID provided");
    return [];
  }

  try {
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { action: "get_subscriptions", telegram_user_id: userId }
    });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw new Error(error.message);
    }

    console.log("Received subscriptions data:", data);
    return data?.subscriptions || [];
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return [];
  }
}

/**
 * Cancels a user subscription
 * @param subscriptionId ID of the subscription to cancel
 * @returns Boolean indicating success
 */
export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  console.log("Cancelling subscription ID:", subscriptionId);

  if (!subscriptionId) {
    console.error("cancelSubscription: No subscription ID provided");
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { action: "cancel_subscription", subscription_id: subscriptionId }
    });

    if (error) {
      console.error("Error cancelling subscription:", error);
      throw new Error(error.message);
    }

    console.log("Subscription cancelled successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return false;
  }
}
