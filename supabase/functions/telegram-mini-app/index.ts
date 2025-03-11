
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface WebAppUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  email?: string;
}

interface TelegramInitData {
  query_id?: string;
  user?: WebAppUser;
  auth_date?: number;
  hash?: string;
}

function extractInitData(initDataString: string): TelegramInitData {
  if (!initDataString) return {};

  try {
    const params = new URLSearchParams(initDataString);
    const user = params.get("user");

    return {
      query_id: params.get("query_id") || undefined,
      user: user ? JSON.parse(decodeURIComponent(user)) : undefined,
      auth_date: params.get("auth_date") ? parseInt(params.get("auth_date")!) : undefined,
      hash: params.get("hash") || undefined,
    };
  } catch (error) {
    console.error("Error parsing initData:", error);
    return {};
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract request body with safety checks
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: error.message,
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    const { start, initData } = body || {};
    console.log("Request payload:", { start, initData });

    if (!start) {
      return new Response(
        JSON.stringify({
          error: "Missing start parameter",
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // 🔄 Check if start parameter is for a group (prefixed with "group_")
    const isGroupRequest = start.toString().startsWith("group_");
    console.log(`🔍 Parameter type: ${isGroupRequest ? "Group" : "Community"} ID - "${start}"`);
    
    let communityQuery;
    let entityId = start;
    
    // Handle group requests
    if (isGroupRequest) {
      // Extract the actual group ID
      entityId = start.toString().substring(6);
      console.log(`🔍 Extracted group ID: "${entityId}"`);
      
      // Query for groups
      communityQuery = supabase
        .from("community_groups")
        .select(`
          id,
          name,
          description,
          owner_id,
          telegram_chat_id,
          telegram_invite_link,
          communities (
            id,
            name,
            description,
            telegram_photo_url,
            telegram_invite_link,
            telegram_chat_id
          )
        `)
        .eq("id", entityId)
        .single();
    } else {
      // Handle standard community requests (UUID or custom link)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(start);
      
      if (isUUID) {
        console.log(`✅ Parameter is a UUID, querying by ID: ${start}`);
        // If it's a UUID, search by ID
        communityQuery = supabase
          .from("communities")
          .select(`
            id,
            name,
            description,
            telegram_photo_url,
            telegram_invite_link,
            telegram_chat_id,
            subscription_plans (
              id,
              name,
              description,
              price,
              interval,
              features
            )
          `)
          .eq("id", start)
          .single();
      } else {
        console.log(`🔗 Parameter appears to be a custom link: "${start}"`);
        // If it's not a UUID, search by custom_link
        communityQuery = supabase
          .from("communities")
          .select(`
            id,
            name,
            description,
            telegram_photo_url,
            telegram_invite_link,
            telegram_chat_id,
            subscription_plans (
              id,
              name,
              description,
              price,
              interval,
              features
            )
          `)
          .eq("custom_link", start)
          .single();
      }
    }

    // Fetch data from database
    const { data, error } = await communityQuery;

    if (error) {
      console.error(`❌ Error fetching ${isGroupRequest ? 'group' : 'community'} with ID "${entityId}":`, error);
      console.error("Error details:", error.message, error.details);
      
      return new Response(
        JSON.stringify({
          error: `Failed to fetch ${isGroupRequest ? 'group' : 'community'} data`,
          details: error.message,
          param: start,
          isGroupRequest
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Process the response based on whether it's a group or community
    let displayCommunity;
    
    if (isGroupRequest) {
      console.log(`✅ Successfully found group: ${data.name} (ID: ${data.id})`);
      console.log(`📝 Group has ${data.communities?.length || 0} communities`);
      
      // For groups, we'll return the group data with its communities
      displayCommunity = {
        id: data.id,
        name: data.name,
        description: data.description || "Group subscription",
        telegram_photo_url: null, // Groups may not have photos
        telegram_invite_link: data.telegram_invite_link,
        telegram_chat_id: data.telegram_chat_id,
        is_group: true,
        communities: data.communities || [],
        subscription_plans: [] // Will fetch separately if needed
      };
      
      // Fetch subscription plans for the group
      const { data: groupPlans, error: groupPlansError } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("group_id", data.id);
        
      if (!groupPlansError && groupPlans) {
        displayCommunity.subscription_plans = groupPlans;
        console.log(`📊 Found ${groupPlans.length} subscription plans for group`);
      } else if (groupPlansError) {
        console.error("Error fetching group plans:", groupPlansError);
      }
      
    } else {
      // Standard community display
      console.log(`✅ Successfully found community: ${data.name} (ID: ${data.id})`);
      displayCommunity = data;
    }
    
    console.log(`📝 Entity description: "${displayCommunity.description || 'NOT SET'}"`);

    // Process Telegram Mini App init data if provided
    let userData = null;
    if (initData) {
      try {
        const parsedInitData = extractInitData(initData);
        console.log("Parsed initData:", parsedInitData);

        if (parsedInitData.user) {
          const telegramUser = parsedInitData.user;
          userData = telegramUser;

          // Check if user exists in the database
          const { data: existingUser, error: userError } = await supabase
            .from("telegram_mini_app_users")
            .select("*")
            .eq("telegram_id", telegramUser.id)
            .single();
            
          console.log("Existing user data from DB:", existingUser);
          console.log("User error:", userError);

          if (!existingUser) {
            // Create new user record
            console.log("Creating new user record for:", telegramUser.id);
            await supabase.from("telegram_mini_app_users").insert([
              {
                telegram_id: telegramUser.id,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                photo_url: telegramUser.photo_url,
                community_id: isGroupRequest ? null : displayCommunity.id, // Use resolved ID, null for groups
                group_id: isGroupRequest ? displayCommunity.id : null, // Set group_id if it's a group request
              },
            ]);
          } else {
            // Update existing user with latest session info
            console.log("Updating existing user:", telegramUser.id);
            const updateData = {
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              username: telegramUser.username,
              photo_url: telegramUser.photo_url,
              last_active: new Date().toISOString()
            };
            
            // Only update community or group ID if this is a direct request for that entity
            if (isGroupRequest) {
              updateData.group_id = displayCommunity.id;
            } else {
              updateData.community_id = displayCommunity.id;
            }
            
            await supabase
              .from("telegram_mini_app_users")
              .update(updateData)
              .eq("telegram_id", telegramUser.id);
              
            // Include email in userData if available
            if (existingUser.email) {
              console.log("Found email in DB, adding to userData:", existingUser.email);
              userData.email = existingUser.email;
            } else {
              console.log("No email found for user in database");
            }
          }
        }
      } catch (error) {
        console.error("Error processing initData:", error);
        // Don't fail the request, just log the error and continue
      }
    }
    
    console.log("Final userData being returned:", userData);
    console.log("Final community data being returned:", JSON.stringify(displayCommunity, null, 2));

    return new Response(
      JSON.stringify({
        community: displayCommunity,
        user: userData,
      }),
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
