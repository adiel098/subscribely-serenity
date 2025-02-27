
import { supabase } from "@/integrations/supabase/client";

export interface Community {
  id: string;
  name: string;
  description: string | null;
  telegram_photo_url: string | null;
  telegram_invite_link: string | null;
  subscription_plans: any[];
  member_count: number;
}

export interface Subscription {
  id: string;
  status: string;
  created_at: string;
  expiry_date: string | null;
  community: Community;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
  } | null;
}

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

export async function searchCommunities(query: string = ""): Promise<Community[]> {
  console.log("Searching communities with query:", query);

  try {
    // Get communities with subscription plans and active payment methods
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { action: "search_communities", query: query, filter_ready: true }
    });

    if (error) {
      console.error("Error searching communities:", error);
      throw new Error(error.message);
    }

    console.log("Received communities data:", data);
    return data?.communities || [];
  } catch (error) {
    console.error("Failed to search communities:", error);
    return [];
  }
}

export async function collectUserEmail(telegramUserId: string, email: string): Promise<boolean> {
  console.log("Collecting email for user ID:", telegramUserId, "Email:", email);

  if (!telegramUserId || !email) {
    console.error("collectUserEmail: Missing required parameters");
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { action: "update_user_email", telegram_user_id: telegramUserId, email: email }
    });

    if (error) {
      console.error("Error updating user email:", error);
      throw new Error(error.message);
    }

    console.log("Email collected successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to collect email:", error);
    return false;
  }
}
