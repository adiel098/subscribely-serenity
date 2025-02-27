
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function extractInitData(initDataString: string): TelegramInitData {
  if (!initDataString) return {};

  try {
    const params = new URLSearchParams(initDataString);
    const userParam = params.get("user");
    let user: WebAppUser | undefined = undefined;
    
    if (userParam) {
      try {
        user = JSON.parse(decodeURIComponent(userParam));
        console.log("Parsed user data:", user);
      } catch (error) {
        console.error("Error parsing user JSON:", error);
      }
    } else {
      console.log("No user param found in initData");
    }

    return {
      query_id: params.get("query_id") || undefined,
      user,
      auth_date: params.get("auth_date") ? parseInt(params.get("auth_date")!) : undefined,
      hash: params.get("hash") || undefined,
    };
  } catch (error) {
    console.error("Error extracting init data:", error);
    return {};
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Safely parse JSON request body
    let requestData;
    try {
      // Check if request body is empty
      const bodyText = await req.text();
      console.log("Request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        return new Response(
          JSON.stringify({
            error: "Empty request body",
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 400 
          }
        );
      }
      
      requestData = JSON.parse(bodyText);
    } catch (error) {
      console.error("JSON parsing error:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          details: error.message,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 400 
        }
      );
    }

    const { start, initData, webAppUser } = requestData;
    console.log("Parsed request payload:", { 
      start, 
      initDataLength: initData ? initData.length : 0,
      initDataPrefix: initData ? initData.substring(0, 50) : null,
      webAppUser
    });

    if (!start) {
      return new Response(
        JSON.stringify({
          error: "Missing start parameter",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch community data
    const { data: community, error: communityError } = await supabase
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
          features,
          community_id
        )
      `)
      .eq("id", start)
      .single();

    if (communityError) {
      console.error("Error fetching community:", communityError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch community data",
          details: communityError.message,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Process user data, prioritizing data in this order:
    // 1. initData from URL (if available)
    // 2. webAppUser from WebApp object (if available)
    let userData = null;
    
    // First, check initData parameter
    if (initData && initData.length > 0) {
      try {
        const parsedInitData = extractInitData(initData);
        console.log("Parsed initData:", parsedInitData);

        if (parsedInitData.user) {
          userData = parsedInitData.user;
          console.log("Using user data from initData:", userData);
        }
      } catch (error) {
        console.error("Error processing initData:", error);
      }
    }
    
    // If no userData yet, use webAppUser if available
    if (!userData && webAppUser) {
      console.log("Using webAppUser data:", webAppUser);
      userData = webAppUser;
    }
    
    // If we have user data from any source, process it
    if (userData) {
      console.log("Processing user data:", userData);
      
      // Check if user exists in the database
      const { data: existingUser } = await supabase
        .from("telegram_mini_app_users")
        .select("*")
        .eq("telegram_id", userData.id)
        .maybeSingle();

      console.log("Existing user check:", existingUser);

      if (!existingUser) {
        // Create new user record
        const { error: insertError } = await supabase
          .from("telegram_mini_app_users")
          .insert([
            {
              telegram_id: userData.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username,
              photo_url: userData.photo_url,
              community_id: start,
            },
          ]);
        
        if (insertError) {
          console.error("Error creating user:", insertError);
        } else {
          console.log("Created new user in database");
        }
      } else {
        // Update existing user with latest session info
        const { error: updateError } = await supabase
          .from("telegram_mini_app_users")
          .update({
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            photo_url: userData.photo_url,
            community_id: start,
            last_active: new Date().toISOString(),
          })
          .eq("telegram_id", userData.id);
          
        if (updateError) {
          console.error("Error updating user:", updateError);
        } else {
          console.log("Updated existing user in database");
        }
        
        // Include email in userData if available
        if (existingUser.email) {
          userData.email = existingUser.email;
        }
      }
    } else {
      console.log("No user data available from any source");
    }

    return new Response(
      JSON.stringify({
        community,
        user: userData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
