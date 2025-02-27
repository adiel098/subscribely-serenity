
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
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  community: Community;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: string;
    features?: string[];
  } | null;
}

export interface CreateMemberData {
  telegram_id: string;
  community_id: string;
  subscription_plan_id: string;
  status?: 'active' | 'inactive' | 'pending';
  payment_id?: string;
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

export async function checkUserExists(telegramUserId: string): Promise<{exists: boolean, hasEmail: boolean}> {
  console.log("Checking if user exists:", telegramUserId);

  if (!telegramUserId) {
    console.error("checkUserExists: No telegram user ID provided");
    return { exists: false, hasEmail: false };
  }

  try {
    const { data, error } = await supabase
      .from('telegram_mini_app_users')
      .select('id, email')
      .eq('telegram_id', telegramUserId)
      .maybeSingle();

    if (error) {
      console.error("Error checking user existence:", error);
      throw new Error(error.message);
    }

    const exists = !!data;
    const hasEmail = exists && !!data.email;
    
    console.log(`User ${telegramUserId} exists: ${exists}, has email: ${hasEmail}`);
    return { exists, hasEmail };
  } catch (error) {
    console.error("Failed to check user existence:", error);
    return { exists: false, hasEmail: false };
  }
}

export async function collectUserEmail(
  telegramUserId: string, 
  email: string, 
  firstName?: string, 
  lastName?: string, 
  communityId?: string
): Promise<boolean> {
  console.log("Collecting email for user ID:", telegramUserId, "Email:", email);

  if (!telegramUserId || !email) {
    console.error("collectUserEmail: Missing required parameters");
    return false;
  }

  try {
    // First check if the user exists
    const { exists } = await checkUserExists(telegramUserId);
    
    let result;
    if (exists) {
      // Update existing user with new data
      const updateData: any = { email };
      
      // Only include fields that have values
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (communityId) updateData.community_id = communityId;
      
      result = await supabase
        .from('telegram_mini_app_users')
        .update(updateData)
        .eq('telegram_id', telegramUserId);
    } else {
      // Create new user with all available data
      const insertData: any = { 
        telegram_id: telegramUserId, 
        email 
      };
      
      // Only include fields that have values
      if (firstName) insertData.first_name = firstName;
      if (lastName) insertData.last_name = lastName;
      if (communityId) insertData.community_id = communityId;
      
      result = await supabase
        .from('telegram_mini_app_users')
        .insert(insertData);
    }
    
    if (result.error) {
      console.error("Error updating/inserting user data:", result.error);
      throw new Error(result.error.message);
    }

    console.log("User data collected successfully for user:", telegramUserId);
    return true;
  } catch (error) {
    console.error("Failed to collect user data:", error);
    return false;
  }
}

export async function createOrUpdateMember(memberData: CreateMemberData): Promise<boolean> {
  console.log("Creating/updating member:", memberData);

  if (!memberData.telegram_id || !memberData.community_id || !memberData.subscription_plan_id) {
    console.error("createOrUpdateMember: Missing required parameters");
    return false;
  }

  try {
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { 
        action: "create_or_update_member", 
        telegram_id: memberData.telegram_id,
        community_id: memberData.community_id,
        subscription_plan_id: memberData.subscription_plan_id,
        status: memberData.status || 'active',
        payment_id: memberData.payment_id
      }
    });

    if (error) {
      console.error("Error creating/updating member:", error);
      throw new Error(error.message);
    }

    console.log("Member created/updated successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to create/update member:", error);
    return false;
  }
}
