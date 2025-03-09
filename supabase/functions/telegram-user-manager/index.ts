import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the auth admin role
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log(`[telegram-user-manager] Received request with action: ${requestData.action}`);
    console.log(`[telegram-user-manager] Request data:`, JSON.stringify(requestData, null, 2));

    // Process based on action
    switch (requestData.action) {
      case "get_subscriptions":
        const subscriptions = await getUserSubscriptions(requestData.telegram_id);
        return jsonResponse({ subscriptions });

      case "cancel_subscription":
        const cancelResult = await cancelSubscription(requestData.subscription_id);
        return jsonResponse(cancelResult);

      case "create_or_update_member":
        console.log(`[telegram-user-manager] Starting create_or_update_member`);
        console.log(`[telegram-user-manager] Member data:`, JSON.stringify(requestData, null, 2));
        const memberResult = await createOrUpdateMember(requestData);
        return jsonResponse(memberResult);

      default:
        return jsonResponse({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    console.error(`[telegram-user-manager] Error processing request:`, error);
    return jsonResponse({ error: error.message }, 500);
  }
});

async function getUserSubscriptions(telegramId) {
  console.log(`[telegram-user-manager] Getting subscriptions for telegram ID: ${telegramId}`);
  
  if (!telegramId) {
    console.error(`[telegram-user-manager] Invalid telegram ID provided: ${telegramId}`);
    throw new Error("Telegram ID is required");
  }

  try {
    const { data, error } = await supabaseAdmin
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
    console.error(`[telegram-user-manager] Error in getUserSubscriptions:`, err);
    throw err;
  }
}

async function cancelSubscription(subscriptionId) {
  console.log(`[telegram-user-manager] Cancelling subscription ID: ${subscriptionId}`);
  
  if (!subscriptionId) {
    console.error(`[telegram-user-manager] No subscription ID provided`);
    return { success: false, error: "Subscription ID is required" };
  }

  try {
    const { data, error } = await supabaseAdmin
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

    console.log(`[telegram-user-manager] Successfully cancelled subscription: ${subscriptionId}`);
    return { success: true, data };
  } catch (err) {
    console.error(`[telegram-user-manager] Error in cancelSubscription:`, err);
    return { success: false, error: err.message };
  }
}

async function createOrUpdateMember(memberData) {
  console.log(`[telegram-user-manager] Creating or updating member with data:`, JSON.stringify(memberData, null, 2));
  
  const { 
    telegram_id, 
    community_id, 
    subscription_plan_id, 
    status, 
    payment_id, 
    username,
    subscription_start_date,
    subscription_end_date
  } = memberData;
  
  // First check if user is suspended - IMPORTANT: We need to check if this is a Telegram ID, not a UUID
  // Instead of checking the profiles table directly with a Telegram ID (which is not a UUID),
  // we'll check the telegram_mini_app_users table which stores Telegram IDs as strings
  try {
    console.log(`[telegram-user-manager] Checking if user ${telegram_id} is suspended`);
    
    // Look up the user in telegram_mini_app_users first
    const { data: telegramUser, error: telegramUserError } = await supabaseAdmin
      .from('telegram_mini_app_users')
      .select('telegram_id, is_suspended')
      .eq('telegram_id', telegram_id)
      .maybeSingle();
      
    if (telegramUserError) {
      console.error(`[telegram-user-manager] Error checking telegram_mini_app_users:`, telegramUserError);
      // Continue despite error, assume user is not suspended
      console.log(`[telegram-user-manager] Proceeding with assumption that user is not suspended`);
    } else if (telegramUser?.is_suspended) {
      console.log(`[telegram-user-manager] Suspended user ${telegram_id} attempted to join/update membership`);
      return { success: false, error: "User is suspended" };
    } else {
      console.log(`[telegram-user-manager] User ${telegram_id} is not suspended or not found in telegram_mini_app_users`);
    }

    // Use provided dates if available, otherwise calculate them
    let startDate = subscription_start_date ? new Date(subscription_start_date) : new Date();
    let endDate = subscription_end_date ? new Date(subscription_end_date) : null;
    
    // If we don't have an end date, calculate it based on plan
    if (!endDate && subscription_plan_id) {
      console.log(`[telegram-user-manager] Getting plan details for ID: ${subscription_plan_id}`);
      const { data: planData, error: planError } = await supabaseAdmin
        .from("subscription_plans")
        .select("interval, price")
        .eq("id", subscription_plan_id)
        .single();

      if (planError) {
        console.error(`[telegram-user-manager] Error fetching plan details:`, planError);
        return { success: false, error: planError.message };
      }

      console.log(`[telegram-user-manager] Retrieved plan details:`, JSON.stringify(planData, null, 2));

      // Calculate subscription end date based on plan interval
      endDate = new Date(startDate);

      // Add duration based on interval
      if (planData.interval === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (planData.interval === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else if (planData.interval === "half-yearly") {
        // Add 6 months for half-yearly subscriptions
        endDate.setMonth(endDate.getMonth() + 6);
        console.log(`[telegram-user-manager] Calculated half-yearly subscription end date: ${endDate.toISOString()}`);
      } else if (planData.interval === "quarterly") {
        // Add 3 months for quarterly subscriptions
        endDate.setMonth(endDate.getMonth() + 3);
        console.log(`[telegram-user-manager] Calculated quarterly subscription end date: ${endDate.toISOString()}`);
      } else if (planData.interval === "weekly") {
        endDate.setDate(endDate.getDate() + 7);
      } else if (planData.interval === "daily") {
        endDate.setDate(endDate.getDate() + 1);
      } else if (planData.interval === "one_time") {
        // For one-time payments, set a default 1-year validity
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
    }

    console.log(`[telegram-user-manager] Using subscription: startDate=${startDate.toISOString()}, endDate=${endDate?.toISOString() || 'Not set'}`);

    // Check if member already exists
    console.log(`[telegram-user-manager] Checking if member exists: telegramId=${telegram_id}, communityId=${community_id}`);
    const { data: existingMember, error: memberError } = await supabaseAdmin
      .from("telegram_chat_members")
      .select("id, subscription_status")
      .eq("telegram_user_id", telegram_id)
      .eq("community_id", community_id)
      .maybeSingle();

    if (memberError) {
      console.error(`[telegram-user-manager] Error checking existing member:`, memberError);
      return { success: false, error: memberError.message };
    }

    let result;
    
    if (existingMember) {
      console.log(`[telegram-user-manager] Member exists, updating: ID=${existingMember.id}`);
      
      // Update existing member
      const { data, error } = await supabaseAdmin
        .from("telegram_chat_members")
        .update({
          subscription_plan_id,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate ? endDate.toISOString() : null,
          subscription_status: "active",
          is_active: true,
          telegram_username: username
        })
        .eq("id", existingMember.id)
        .select();

      if (error) {
        console.error(`[telegram-user-manager] Error updating member:`, error);
        return { success: false, error: error.message };
      }

      result = { success: true, data, isNew: false };
    } else {
      console.log(`[telegram-user-manager] Member doesn't exist, creating new member`);
      
      // Create new member
      const { data, error } = await supabaseAdmin
        .from("telegram_chat_members")
        .insert({
          telegram_user_id: telegram_id,
          community_id,
          subscription_plan_id,
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate ? endDate.toISOString() : null,
          subscription_status: "active",
          is_active: true,
          telegram_username: username
        })
        .select();

      if (error) {
        console.error(`[telegram-user-manager] Error creating member:`, error);
        return { success: false, error: error.message };
      }

      result = { success: true, data, isNew: true };
    }

    console.log(`[telegram-user-manager] Member created/updated successfully:`, JSON.stringify(result, null, 2));
    
    // Log subscription activity
    await logSubscriptionActivity(
      telegram_id,
      community_id,
      existingMember ? 'subscription_renewed' : 'subscription_created',
      `Plan: ${subscription_plan_id}, Payment: ${payment_id || 'N/A'}`
    );

    return result;
  } catch (err) {
    console.error(`[telegram-user-manager] Unexpected error in createOrUpdateMember:`, err);
    return { success: false, error: err.message };
  }
}

async function logSubscriptionActivity(telegramUserId, communityId, activityType, details) {
  console.log(`[telegram-user-manager] Logging subscription activity: ${activityType} for user ${telegramUserId} in community ${communityId}`);
  try {
    const { error } = await supabaseAdmin
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

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
