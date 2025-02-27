
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

type TelegramUserData = {
  telegram_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
  community_id?: string;
}

serve(async (req) => {
  console.log("Processing request to telegram-user-manager");

  // Create a Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { action, ...params } = await req.json();
    console.log(`Received action: ${action}`, params);

    switch (action) {
      case "save_user":
        return await saveUser(supabase, params as TelegramUserData);
      case "get_user":
        return await getUser(supabase, params.telegram_user_id);
      case "update_user_email":
        return await updateUserEmail(supabase, params.telegram_user_id, params.email);
      case "get_subscriptions":
        return await getUserSubscriptions(supabase, params.telegram_user_id);
      case "cancel_subscription":
        return await cancelSubscription(supabase, params.subscription_id);
      case "search_communities":
        return await searchCommunities(supabase, params.query, params.filter_ready);
      default:
        return new Response(
          JSON.stringify({ error: "Unknown action" }),
          { headers: { "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in telegram-user-manager:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function saveUser(supabase, userData: TelegramUserData) {
  console.log("Saving user data:", userData);

  if (!userData?.telegram_id) {
    console.error("Missing required parameter: telegram_id");
    return new Response(
      JSON.stringify({ error: "Missing telegram_id" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from("telegram_mini_app_users")
      .select("*")
      .eq("telegram_id", userData.telegram_id)
      .maybeSingle();

    if (findError) {
      console.error("Error finding user:", findError);
      throw findError;
    }

    let result;

    if (existingUser) {
      console.log("User exists, updating:", existingUser.id);
      const { data, error } = await supabase
        .from("telegram_mini_app_users")
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          email: userData.email || existingUser.email,
          community_id: userData.community_id || existingUser.community_id,
          last_active: new Date().toISOString()
        })
        .eq("telegram_id", userData.telegram_id)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        throw error;
      }

      result = data;
    } else {
      console.log("Creating new user");
      const { data, error } = await supabase
        .from("telegram_mini_app_users")
        .insert({
          telegram_id: userData.telegram_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          email: userData.email,
          community_id: userData.community_id
        })
        .select()
        .single();

      if (error) {
        console.error("Error inserting user:", error);
        throw error;
      }

      result = data;
    }

    return new Response(
      JSON.stringify({ success: true, user: result }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in saveUser:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function getUser(supabase, telegramUserId: string) {
  console.log("Getting user data for Telegram ID:", telegramUserId);

  if (!telegramUserId) {
    console.error("Missing required parameter: telegram_user_id");
    return new Response(
      JSON.stringify({ error: "Missing telegram_user_id" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("telegram_mini_app_users")
      .select("*")
      .eq("telegram_id", telegramUserId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ user: data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in getUser:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function updateUserEmail(supabase, telegramUserId: string, email: string) {
  console.log("Updating email for Telegram ID:", telegramUserId, "Email:", email);

  if (!telegramUserId || !email) {
    console.error("Missing required parameters: telegram_user_id or email");
    return new Response(
      JSON.stringify({ error: "Missing required parameters" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("telegram_mini_app_users")
      .update({ email })
      .eq("telegram_id", telegramUserId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user email:", error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, user: data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in updateUserEmail:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function getUserSubscriptions(supabase, telegramUserId: string) {
  console.log("Getting subscriptions for Telegram ID:", telegramUserId);

  if (!telegramUserId) {
    console.error("Missing required parameter: telegram_user_id");
    return new Response(
      JSON.stringify({ error: "Missing telegram_user_id" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  try {
    // Get all active members for this Telegram user across all communities
    const { data: members, error: membersError } = await supabase
      .from("telegram_chat_members")
      .select(`
        id, 
        is_active, 
        subscription_status, 
        subscription_start_date, 
        subscription_end_date,
        community_id, 
        subscription_plan_id,
        communities:community_id (
          id, 
          name, 
          description,
          telegram_photo_url,
          telegram_invite_link
        ),
        subscription_plans:subscription_plan_id (
          id,
          name,
          price,
          interval
        )
      `)
      .eq("telegram_user_id", telegramUserId);

    if (membersError) {
      console.error("Error fetching subscriptions:", membersError);
      throw membersError;
    }

    // Transform data into expected format
    const subscriptions = members.map(member => ({
      id: member.id,
      status: member.subscription_status ? "active" : "expired",
      created_at: member.subscription_start_date || new Date().toISOString(),
      expiry_date: member.subscription_end_date,
      community: member.communities,
      plan: member.subscription_plans
    }));

    console.log(`Found ${subscriptions.length} subscriptions for user ${telegramUserId}`);

    return new Response(
      JSON.stringify({ subscriptions }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in getUserSubscriptions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function cancelSubscription(supabase, subscriptionId: string) {
  console.log("Cancelling subscription ID:", subscriptionId);

  if (!subscriptionId) {
    console.error("Missing required parameter: subscription_id");
    return new Response(
      JSON.stringify({ error: "Missing subscription_id" }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }

  try {
    // Update member record to set subscription_status to false
    const { data, error } = await supabase
      .from("telegram_chat_members")
      .update({ subscription_status: false })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }

    // Log the activity
    await supabase
      .from("subscription_activity_logs")
      .insert({
        telegram_user_id: data.telegram_user_id,
        community_id: data.community_id,
        activity_type: "subscription_cancelled",
        details: `Subscription cancelled by user via Mini App`
      });

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in cancelSubscription:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}

async function searchCommunities(supabase, query: string = "", filterReady: boolean = false) {
  console.log("Searching communities with query:", query, "Filter ready:", filterReady);

  try {
    // Start building the query
    let communityQuery = supabase
      .from("communities")
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_invite_link,
        subscription_plans (
          id, name, price, interval
        ),
        member_count,
        payment_methods:payment_methods!inner (
          id
        )
      `);

    // Add search condition if query is provided
    if (query && query.trim() !== '') {
      communityQuery = communityQuery.ilike('name', `%${query}%`);
    }
    
    // If filterReady is true, only get communities with subscription plans and payment methods
    if (filterReady) {
      // We use the inner join on payment_methods in the select query above
      // and also filter for communities that have at least one active subscription plan
      communityQuery = communityQuery
        .not("subscription_plans", "is", null)
        .gt("subscription_plans.id.count", 0)
        .filter("payment_methods.is_active", "eq", true);
    }

    const { data, error } = await communityQuery;

    if (error) {
      console.error("Error searching communities:", error);
      throw error;
    }

    // Transform data to remove payment methods from the response
    const communities = data.map(community => ({
      id: community.id,
      name: community.name,
      description: community.description,
      telegram_photo_url: community.telegram_photo_url,
      telegram_invite_link: community.telegram_invite_link,
      subscription_plans: community.subscription_plans,
      member_count: community.member_count
    }));

    console.log(`Found ${communities.length} communities`);

    return new Response(
      JSON.stringify({ communities }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in searchCommunities:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
}
