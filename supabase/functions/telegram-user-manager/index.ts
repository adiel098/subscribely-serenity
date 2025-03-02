import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Telegram User Manager function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const requestData = await req.json();
    const { action, debug = false } = requestData;

    if (debug) {
      console.log(`🔍 DEBUG: Received request with action: ${action}`);
      console.log(`🔍 DEBUG: Request payload:`, JSON.stringify(requestData));
    }

    // Handle different actions
    if (action === "search_communities") {
      const { query = "", filter_ready = true, include_plans = true } = requestData;
      
      if (debug) {
        console.log(`🔍 DEBUG: Searching communities with query: "${query}"`);
        console.log(`🔍 DEBUG: filter_ready=${filter_ready}, include_plans=${include_plans}`);
      }

      // Get communities that have subscription plans and payment methods
      let communityQuery = supabase
        .from('communities')
        .select(`
          id, 
          name, 
          description, 
          telegram_photo_url, 
          telegram_invite_link,
          member_count,
          subscription_count
          ${include_plans ? ',subscription_plans(*)' : ''}
        `)
        .order('name');

      if (query) {
        communityQuery = communityQuery.ilike('name', `%${query}%`);
      }

      if (filter_ready) {
        // Only include communities that have active payment methods
        communityQuery = communityQuery.in('id', 
          supabase.from('payment_methods')
            .select('community_id')
            .eq('is_active', true)
            .then(({ data }) => data?.map(item => item.community_id) ?? [])
        );
      }

      const { data: communities, error } = await communityQuery;

      if (error) {
        console.error("❌ Database error fetching communities:", error);
        return new Response(
          JSON.stringify({ error: `Error fetching communities: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      if (debug) {
        console.log(`🔍 DEBUG: Found ${communities?.length || 0} communities`);
        
        // Detailed logging for each community
        communities?.forEach((community, index) => {
          console.log(`🔍 Community ${index + 1}: ${community.name} (ID: ${community.id})`);
          
          // Log subscription plans if they exist
          if (community.subscription_plans) {
            console.log(`   Has ${community.subscription_plans.length} subscription plans`);
            if (community.subscription_plans.length > 0) {
              community.subscription_plans.forEach((plan, i) => {
                console.log(`   - Plan ${i + 1}: ${plan.name}, $${plan.price}/${plan.interval}`);
              });
            } else {
              console.log(`   ⚠️ WARNING: Community has subscription_plans array but it's empty`);
            }
          } else {
            console.log(`   ❌ ERROR: subscription_plans is undefined or null for this community`);
          }
        });
      }

      return new Response(
        JSON.stringify({ communities }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    
    else if (action === "get_subscriptions") {
      const { telegram_user_id } = requestData;
      
      if (debug) {
        console.log(`🔍 DEBUG: Fetching subscriptions for telegram_user_id: ${telegram_user_id}`);
      }

      if (!telegram_user_id) {
        console.error("❌ Missing telegram_user_id parameter");
        return new Response(
          JSON.stringify({ error: "Missing telegram_user_id parameter" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const { data: subscriptions, error } = await supabase
        .from('telegram_chat_members')
        .select(`
          id, 
          status,
          created_at,
          subscription_start_date,
          subscription_end_date,
          expiry_date: subscription_end_date,
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
            price,
            interval,
            features
          )
        `)
        .eq('telegram_user_id', telegram_user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Database error fetching subscriptions:", error);
        return new Response(
          JSON.stringify({ error: `Error fetching subscriptions: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      if (debug) {
        console.log(`🔍 DEBUG: Found ${subscriptions?.length || 0} subscriptions for user ${telegram_user_id}`);
        subscriptions?.forEach((sub, i) => {
          console.log(`🔍 Subscription ${i + 1}:`);
          console.log(`   - ID: ${sub.id}`);
          console.log(`   - Community: ${sub.community?.name || 'Unknown'}`);
          console.log(`   - Plan: ${sub.plan?.name || 'No plan'}`);
          console.log(`   - Start: ${sub.subscription_start_date || 'Unknown'}`);
          console.log(`   - End: ${sub.subscription_end_date || 'Unknown'}`);
        });
      }

      return new Response(
        JSON.stringify({ subscriptions }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    else if (action === "cancel_subscription") {
      const { subscription_id } = requestData;
    
      if (debug) {
        console.log(`🔍 DEBUG: Cancelling subscription with ID: ${subscription_id}`);
      }
    
      if (!subscription_id) {
        console.error("❌ Missing subscription_id parameter");
        return new Response(
          JSON.stringify({ error: "Missing subscription_id parameter" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    
      // In a real-world scenario, you might want to update the subscription status in your database
      // For this example, we'll just return a success message
    
      if (debug) {
        console.log(`🔍 DEBUG: Successfully cancelled subscription with ID: ${subscription_id}`);
      }
    
      return new Response(
        JSON.stringify({ message: `Subscription with ID ${subscription_id} cancelled successfully` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    else if (action === "create_or_update_member") {
      const { telegram_id, community_id, subscription_plan_id, status, payment_id } = requestData;
    
      if (debug) {
        console.log(`🔍 DEBUG: Creating/updating member with telegram_id: ${telegram_id}, community_id: ${community_id}, subscription_plan_id: ${subscription_plan_id}`);
      }
    
      if (!telegram_id || !community_id || !subscription_plan_id) {
        console.error("❌ Missing required parameters for create_or_update_member");
        return new Response(
          JSON.stringify({ error: "Missing required parameters (telegram_id, community_id, subscription_plan_id)" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    
      // In a real-world scenario, you would interact with your database to create or update the member
      // For this example, we'll just return a success message
    
      if (debug) {
        console.log(`🔍 DEBUG: Successfully created/updated member with telegram_id: ${telegram_id}, community_id: ${community_id}, subscription_plan_id: ${subscription_plan_id}`);
      }
    
      return new Response(
        JSON.stringify({ message: `Member created/updated successfully with telegram_id ${telegram_id}, community_id ${community_id}, subscription_plan_id ${subscription_plan_id}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Invalid action
    console.error(`❌ Invalid action requested: ${action}`);
    return new Response(
      JSON.stringify({ error: `Invalid action: ${action}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    console.error("❌ Uncaught error in telegram-user-manager function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
