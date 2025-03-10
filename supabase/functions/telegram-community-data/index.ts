
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
    const { community_id, debug = true, fetch_telegram_data = false } = requestData; // Add fetch_telegram_data flag

    console.log(`🔍 DEBUG: Received request with community_id: ${community_id}`);
    console.log(`🔍 DEBUG: Full request data:`, JSON.stringify(requestData, null, 2));

    if (debug) {
      console.log(`🔍 DEBUG: Fetching community data for ID or link: ${community_id}`);
    }

    if (!community_id) {
      console.error("❌ Missing community_id parameter");
      return new Response(
        JSON.stringify({ error: "Missing community_id parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if community_id is a UUID or a custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(community_id);
    let communityQuery;
    
    if (isUUID) {
      console.log(`🔍 DEBUG: Parameter is a UUID, searching by ID: ${community_id}`);
      // If it's a UUID, search by ID
      communityQuery = supabase
        .from('communities')
        .select(`
          id, 
          name, 
          description, 
          telegram_photo_url, 
          telegram_invite_link,
          telegram_chat_id,
          member_count,
          subscription_count,
          custom_link,
          subscription_plans(*)
        `)
        .eq('id', community_id)
        .single();
    } else {
      console.log(`🔗 DEBUG: Parameter appears to be a custom link: "${community_id}"`);
      // If it's not a UUID, search by custom_link
      communityQuery = supabase
        .from('communities')
        .select(`
          id, 
          name, 
          description, 
          telegram_photo_url, 
          telegram_invite_link,
          telegram_chat_id,
          member_count,
          subscription_count,
          custom_link,
          subscription_plans(*)
        `)
        .eq('custom_link', community_id)
        .single();
    }

    // Get community data with subscription plans
    console.log(`🔍 DEBUG: Executing database query for community ID or link: ${community_id}`);
    const { data: community, error } = await communityQuery;

    if (error) {
      console.error(`❌ Database error fetching community ${community_id}:`, error);
      console.error(`Error details: ${error.message}, ${error.details}`);
      return new Response(
        JSON.stringify({ 
          error: `Error fetching community: ${error.message}`,
          details: error.details,
          isUUID: isUUID,
          param: community_id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!community) {
      console.error(`❌ Community with ${isUUID ? 'ID' : 'custom link'} "${community_id}" not found`);
      return new Response(
        JSON.stringify({ 
          error: "Community not found",
          param: community_id,
          isUUID: isUUID 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log(`✅ Retrieved community from database:`, JSON.stringify(community, null, 2));
    console.log(`🖼️ Photo URL in database: ${community.telegram_photo_url || 'Not set'}`);
    console.log(`📱 Telegram chat ID: ${community.telegram_chat_id || 'Not set'}`);
    console.log(`🔗 Custom link: ${community.custom_link || 'Not set'}`);
    console.log(`📝 Community description: "${community.description || 'NOT SET'}" (type: ${typeof community.description})`);
    
    // Fetch Telegram channel info if requested and chat_id is available
    if (fetch_telegram_data && community.telegram_chat_id) {
      try {
        console.log(`🔍 DEBUG: Fetching Telegram channel info for chat ID: ${community.telegram_chat_id}`);
        
        const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
        if (!botToken) {
          console.error("❌ TELEGRAM_BOT_TOKEN is not set in environment variables");
        } else {
          // Call the Telegram getChat API
          const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
          const telegramResponse = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ chat_id: community.telegram_chat_id })
          });
          
          const telegramData = await telegramResponse.json();
          console.log("📥 Telegram API response:", JSON.stringify(telegramData, null, 2));
          
          if (telegramData.ok) {
            const chatInfo = telegramData.result;
            const telegramDescription = chatInfo.description;
            
            console.log(`📝 Channel description from Telegram: "${telegramDescription || 'NOT SET'}"`);
            
            // If the description from Telegram is different from the one in the database, update it
            if (telegramDescription && telegramDescription !== community.description) {
              console.log(`✏️ Updating description for community ${community.id} in database`);
              
              const { data: updateData, error: updateError } = await supabase
                .from('communities')
                .update({ description: telegramDescription })
                .eq('id', community.id);
              
              if (updateError) {
                console.error(`❌ Error updating community description: ${updateError.message}`);
              } else {
                console.log(`✅ Successfully updated community description`);
                // Update the description in the response
                community.description = telegramDescription;
              }
            }
          } else {
            console.error(`❌ Telegram API error: ${telegramData.description}`);
          }
        }
      } catch (telegramError) {
        console.error("❌ Error fetching Telegram channel info:", telegramError);
      }
    }
    
    if (debug) {
      console.log(`🔍 DEBUG: Found community: ${community.name} (ID: ${community.id})`);
      console.log(`🔍 DEBUG: Telegram chat ID: ${community.telegram_chat_id || 'Not set'}`);
      
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
        .eq('community_id', community.id);
        
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

    // Extra debugging for photo URL
    if (community.telegram_photo_url) {
      console.log(`📸 Community has a photo URL: ${community.telegram_photo_url}`);
      try {
        // Test if the photo URL is accessible
        const photoTestResponse = await fetch(community.telegram_photo_url, { method: 'HEAD' });
        console.log(`📸 Photo URL check status: ${photoTestResponse.status} ${photoTestResponse.statusText}`);
        if (!photoTestResponse.ok) {
          console.error(`❌ Photo URL might be invalid or inaccessible`);
        }
      } catch (photoError) {
        console.error(`❌ Error checking photo URL: ${photoError.message}`);
      }
    } else {
      console.log(`❌ Community does NOT have a photo URL stored in the database`);
      console.log(`ℹ️ Checking if we should fetch a photo using telegram_chat_id: ${community.telegram_chat_id || 'Not available'}`);
    }

    console.log(`📤 Returning response with community data`);
    console.log(`📤 Final community data returned:`, JSON.stringify(community, null, 2));
    
    return new Response(
      JSON.stringify({ community }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Uncaught error in telegram-community-data function:", error);
    console.error("❌ Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
