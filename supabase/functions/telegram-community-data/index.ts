
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log("Telegram Community Data function started");

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
    const { community_id, debug = true } = requestData; // Enable debug by default for now

    if (debug) {
      console.log(`🔍 DEBUG: Fetching community data for ID: ${community_id}`);
    }

    if (!community_id) {
      console.error("❌ Missing community_id parameter");
      return new Response(
        JSON.stringify({ error: "Missing community_id parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Get community data with subscription plans
    const { data: community, error } = await supabase
      .from('communities')
      .select(`
        id, 
        name, 
        description, 
        telegram_photo_url, 
        telegram_invite_link,
        member_count,
        subscription_count,
        subscription_plans(*)
      `)
      .eq('id', community_id)
      .single();

    if (error) {
      console.error(`❌ Database error fetching community ${community_id}:`, error);
      return new Response(
        JSON.stringify({ error: `Error fetching community: ${error.message}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!community) {
      console.error(`❌ Community with ID ${community_id} not found`);
      return new Response(
        JSON.stringify({ error: "Community not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (debug) {
      console.log(`🔍 DEBUG: Found community: ${community.name} (ID: ${community.id})`);
      
      // Log subscription plans details
      if (community.subscription_plans) {
        console.log(`🔍 DEBUG: Community has ${community.subscription_plans.length} subscription plans`);
        community.subscription_plans.forEach((plan, i) => {
          console.log(`   - Plan ${i + 1}: ${plan.name}, $${plan.price}/${plan.interval}`);
          console.log(`     Description: ${plan.description || 'None'}`);
          console.log(`     Features: ${JSON.stringify(plan.features || [])}`);
          console.log(`     Is active: ${plan.is_active}`);
        });
      } else {
        console.log(`❌ ERROR: subscription_plans is undefined or null for this community`);
      }
      
      // Check payment methods for this community
      const { data: paymentMethods, error: pmError } = await supabase
        .from('payment_methods')
        .select('id, provider, is_active')
        .eq('community_id', community_id);
        
      if (pmError) {
        console.error(`❌ Error fetching payment methods:`, pmError);
      } else {
        console.log(`🔍 DEBUG: Community has ${paymentMethods?.length || 0} payment methods`);
        paymentMethods?.forEach((pm, i) => {
          console.log(`   - Payment method ${i + 1}: ${pm.provider} (Active: ${pm.is_active})`);
        });
      }
    }

    // Ensure subscription_plans is always an array
    if (!community.subscription_plans) {
      console.warn(`⚠️ subscription_plans is null/undefined for community ${community_id} - setting to empty array`);
      community.subscription_plans = [];
    }

    return new Response(
      JSON.stringify({ community }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Uncaught error in telegram-community-data function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
