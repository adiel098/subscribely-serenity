
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

    // Check if start is a UUID or a custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(start);
    let communityQuery;
    
    if (isUUID) {
      // If it's a UUID, search by ID
      communityQuery = supabase
        .from("communities")
        .select(`
          id,
          name,
          description,
          telegram_photo_url,
          telegram_invite_link,
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
      // If it's not a UUID, search by custom_link
      communityQuery = supabase
        .from("communities")
        .select(`
          id,
          name,
          description,
          telegram_photo_url,
          telegram_invite_link,
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

    // Fetch community data
    const { data: community, error: communityError } = await communityQuery;

    if (communityError) {
      console.error("Error fetching community:", communityError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch community data",
          details: communityError.message,
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

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
                community_id: community.id, // Use resolved community ID
              },
            ]);
          } else {
            // Update existing user with latest session info
            console.log("Updating existing user:", telegramUser.id);
            await supabase
              .from("telegram_mini_app_users")
              .update({
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                photo_url: telegramUser.photo_url,
                community_id: community.id, // Use resolved community ID
              })
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

    return new Response(
      JSON.stringify({
        community,
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
