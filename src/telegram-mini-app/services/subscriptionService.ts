import { supabase } from "@/integrations/supabase/client";
import { logServiceAction, validateTelegramId, invokeSupabaseFunction } from "./utils/serviceUtils";
import { Community, Subscription } from "../types/community.types";

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  logServiceAction("getUserSubscriptions", { userId });

  if (!validateTelegramId(userId)) {
    return [];
  }

  try {
    const { data, error } = await invokeSupabaseFunction("telegram-user-manager", {
      action: "get_subscriptions", 
      telegram_user_id: userId
    });

    if (error) {
      console.error("Error fetching subscriptions:", error);
      throw new Error(error.message);
    }

    logServiceAction("Received subscriptions data", data);
    return data?.subscriptions || [];
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return [];
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  logServiceAction("cancelSubscription", { subscriptionId });

  if (!subscriptionId) {
    console.error("cancelSubscription: No subscription ID provided");
    return false;
  }

  try {
    const { data, error } = await invokeSupabaseFunction("telegram-user-manager", {
      action: "cancel_subscription", 
      subscription_id: subscriptionId
    });

    if (error) {
      console.error("Error cancelling subscription:", error);
      throw new Error(error.message);
    }

    logServiceAction("Subscription cancelled successfully", data);
    return true;
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return false;
  }
}

export interface CreateMemberData {
  telegram_id: string;
  community_id: string;
  subscription_plan_id: string;
  status?: 'active' | 'inactive' | 'pending';
  payment_id?: string;
}

export async function createOrUpdateMember(memberData: CreateMemberData): Promise<boolean> {
  logServiceAction("createOrUpdateMember", memberData);

  if (!memberData.telegram_id || !memberData.community_id || !memberData.subscription_plan_id) {
    console.error("createOrUpdateMember: Missing required parameters");
    return false;
  }
  
  if (!validateTelegramId(memberData.telegram_id)) {
    return false;
  }

  try {
    const { data, error } = await invokeSupabaseFunction("telegram-user-manager", {
      action: "create_or_update_member", 
      telegram_id: memberData.telegram_id,
      community_id: memberData.community_id,
      subscription_plan_id: memberData.subscription_plan_id,
      status: memberData.status || 'active',
      payment_id: memberData.payment_id
    });

    if (error) {
      console.error("Error creating/updating member:", error);
      throw new Error(error.message);
    }

    logServiceAction("Member created/updated successfully", data);
    return true;
  } catch (error) {
    console.error("Failed to create/update member:", error);
    return false;
  }
}
