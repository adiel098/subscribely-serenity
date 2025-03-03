
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const requestData = await req.json();
    console.log("Received request data:", requestData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check which action to perform
    const action = requestData.action;
    console.log("Requested action:", action);

    let response;
    switch (action) {
      case "get_subscriptions":
        response = await getUserSubscriptions(supabase, requestData);
        break;
      case "cancel_subscription":
        response = await cancelSubscription(supabase, requestData);
        break;
      case "create_or_update_member":
        response = await createOrUpdateMember(supabase, requestData);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    // Return successful response
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function getUserSubscriptions(supabase, requestData) {
  const { telegram_id } = requestData;
  
  if (!telegram_id) {
    throw new Error("Telegram ID is required");
  }
  
  console.log(`Getting subscriptions for Telegram user ID: ${telegram_id}`);
  
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
      total_messages,
      community_id,
      community:communities(
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
    .eq("telegram_user_id", telegram_id)
    .order("joined_at", { ascending: false });
  
  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to fetch subscriptions: ${error.message}`);
  }
  
  return { subscriptions: data || [] };
}

async function cancelSubscription(supabase, requestData) {
  const { subscription_id } = requestData;
  
  if (!subscription_id) {
    throw new Error("Subscription ID is required");
  }
  
  console.log(`Cancelling subscription with ID: ${subscription_id}`);
  
  const { data, error } = await supabase
    .from("telegram_chat_members")
    .update({
      subscription_status: false,
      is_active: false
    })
    .eq("id", subscription_id)
    .select();
  
  if (error) {
    console.error("Database error:", error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }
  
  return { success: true, subscription: data?.[0] || null };
}

async function createOrUpdateMember(supabase, requestData) {
  const { 
    telegram_id, 
    community_id, 
    subscription_plan_id, 
    status, 
    payment_id,
    username 
  } = requestData;
  
  if (!telegram_id || !community_id || !subscription_plan_id) {
    throw new Error("Required parameters missing");
  }
  
  console.log(`Creating/updating member: ${telegram_id} for community: ${community_id}`);
  
  // Check if the member already exists
  const { data: existingMember, error: checkError } = await supabase
    .from("telegram_chat_members")
    .select("*")
    .eq("telegram_user_id", telegram_id)
    .eq("community_id", community_id)
    .maybeSingle();
  
  if (checkError) {
    console.error("Database error checking existing member:", checkError);
    throw new Error(`Failed to check existing member: ${checkError.message}`);
  }
  
  // Get subscription plan details to determine subscription duration
  const { data: planData, error: planError } = await supabase
    .from("subscription_plans")
    .select("interval")
    .eq("id", subscription_plan_id)
    .single();
  
  if (planError) {
    console.error("Database error fetching plan details:", planError);
    throw new Error(`Failed to fetch plan details: ${planError.message}`);
  }
  
  // Calculate subscription end date based on plan interval
  const startDate = new Date();
  let endDate = new Date();
  
  switch (planData.interval) {
    case "monthly":
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case "quarterly":
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case "biannual":
      endDate.setMonth(endDate.getMonth() + 6);
      break;
    case "yearly":
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    default:
      endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
  }
  
  // Update or insert the member
  let result;
  if (existingMember) {
    // Update existing member
    const { data, error } = await supabase
      .from("telegram_chat_members")
      .update({
        subscription_plan_id: subscription_plan_id,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_status: true,
        is_active: true,
        telegram_username: username || existingMember.telegram_username
      })
      .eq("telegram_user_id", telegram_id)
      .eq("community_id", community_id)
      .select();
    
    if (error) {
      console.error("Database error updating member:", error);
      throw new Error(`Failed to update member: ${error.message}`);
    }
    
    result = { member: data?.[0], isNewMember: false };
  } else {
    // Insert new member
    const { data, error } = await supabase
      .from("telegram_chat_members")
      .insert({
        telegram_user_id: telegram_id,
        community_id: community_id,
        subscription_plan_id: subscription_plan_id,
        subscription_start_date: startDate.toISOString(),
        subscription_end_date: endDate.toISOString(),
        subscription_status: true,
        is_active: true,
        telegram_username: username
      })
      .select();
    
    if (error) {
      console.error("Database error inserting member:", error);
      throw new Error(`Failed to insert member: ${error.message}`);
    }
    
    result = { member: data?.[0], isNewMember: true };
  }
  
  // Log the activity
  await supabase
    .from("subscription_activity_logs")
    .insert({
      telegram_user_id: telegram_id,
      community_id: community_id,
      activity_type: existingMember ? "subscription_renewed" : "subscription_created",
      details: `Plan ID: ${subscription_plan_id}, Payment ID: ${payment_id || "N/A"}`
    });
  
  return result;
}
