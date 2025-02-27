
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface TelegramUser {
  id?: string;
  telegram_id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
  community_id?: string;
}

interface RequestBody {
  telegram_id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
  community_id?: string;
  initData?: string;
}

// Extract user data from initData string (fallback method)
function extractInitData(initDataString: string): any {
  if (!initDataString) return {};

  try {
    const params = new URLSearchParams(initDataString);
    const user = params.get("user");

    return {
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

    // Extract request body
    let body: RequestBody;
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

    console.log("Request payload:", body);

    let telegramUser: TelegramUser = {};
    
    // Method 1: Direct parameters provided
    if (body.telegram_id) {
      telegramUser = {
        telegram_id: body.telegram_id,
        first_name: body.first_name,
        last_name: body.last_name,
        username: body.username,
        photo_url: body.photo_url,
        community_id: body.community_id,
        email: body.email
      };
    } 
    // Method 2: Extract from initData (fallback)
    else if (body.initData && body.community_id) {
      const parsedInitData = extractInitData(body.initData);
      
      if (parsedInitData.user) {
        telegramUser = {
          telegram_id: parsedInitData.user.id?.toString(),
          first_name: parsedInitData.user.first_name,
          last_name: parsedInitData.user.last_name,
          username: parsedInitData.user.username,
          photo_url: parsedInitData.user.photo_url,
          community_id: body.community_id
        };
      }
    }

    if (!telegramUser.telegram_id || !body.community_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required user identification",
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from("telegram_mini_app_users")
      .select("*")
      .eq("telegram_id", telegramUser.telegram_id)
      .maybeSingle();

    if (userError) {
      console.error("Error checking for existing user:", userError);
      return new Response(
        JSON.stringify({
          error: "Database error when checking user",
          details: userError.message,
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    let user = existingUser;

    // If user doesn't exist, create new record
    if (!existingUser) {
      const { data: newUser, error: insertError } = await supabase
        .from("telegram_mini_app_users")
        .insert([
          {
            telegram_id: telegramUser.telegram_id,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            photo_url: telegramUser.photo_url,
            community_id: body.community_id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Error creating new user:", insertError);
        return new Response(
          JSON.stringify({
            error: "Failed to create user record",
            details: insertError.message,
          }),
          { headers: corsHeaders, status: 500 }
        );
      }

      user = newUser;
    } 
    // Update existing user with latest info
    else {
      const { data: updatedUser, error: updateError } = await supabase
        .from("telegram_mini_app_users")
        .update({
          first_name: telegramUser.first_name || existingUser.first_name,
          last_name: telegramUser.last_name || existingUser.last_name,
          username: telegramUser.username || existingUser.username,
          photo_url: telegramUser.photo_url || existingUser.photo_url,
          community_id: body.community_id,
        })
        .eq("telegram_id", telegramUser.telegram_id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating user:", updateError);
        // Don't fail the request, just log the error
      } else {
        user = updatedUser;
      }
    }

    return new Response(
      JSON.stringify({
        user: {
          id: user.telegram_id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          email: user.email
        }
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
