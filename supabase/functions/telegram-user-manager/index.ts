
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
    console.log("🚀 telegram-user-manager function starting");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Missing Supabase environment variables");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          details: "Missing required environment variables",
        }),
        { headers: corsHeaders, status: 500 }
      );
    }
    
    console.log("🔌 Creating Supabase client with URL:", supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extract request body
    let body: RequestBody;
    try {
      body = await req.json();
      console.log("📦 Received request payload:", JSON.stringify(body));
    } catch (error) {
      console.error("❌ Error parsing request body:", error);
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: error.message,
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    let telegramUser: TelegramUser = {};
    
    // Method 1: Direct parameters provided
    if (body.telegram_id) {
      console.log("👤 Processing user with telegram_id:", body.telegram_id);
      telegramUser = {
        telegram_id: body.telegram_id,
        first_name: body.first_name,
        last_name: body.last_name,
        username: body.username,
        photo_url: body.photo_url,
        community_id: body.community_id,
        email: body.email
      };
      console.log("👤 Constructed user object:", JSON.stringify(telegramUser));
    } 
    // Method 2: Extract from initData (fallback)
    else if (body.initData && body.community_id) {
      console.log("🔍 Extracting user from initData");
      const parsedInitData = extractInitData(body.initData);
      
      if (parsedInitData.user) {
        console.log("✅ Successfully extracted user from initData:", JSON.stringify(parsedInitData.user));
        telegramUser = {
          telegram_id: parsedInitData.user.id?.toString(),
          first_name: parsedInitData.user.first_name,
          last_name: parsedInitData.user.last_name,
          username: parsedInitData.user.username,
          photo_url: parsedInitData.user.photo_url,
          community_id: body.community_id
        };
        console.log("👤 Constructed user object from initData:", JSON.stringify(telegramUser));
      } else {
        console.log("⚠️ No user found in initData");
      }
    }

    if (!telegramUser.telegram_id || !body.community_id) {
      console.error("❌ Missing required fields:", { 
        telegram_id: telegramUser.telegram_id, 
        community_id: body.community_id 
      });
      return new Response(
        JSON.stringify({
          error: "Missing required user identification",
          details: "Both telegram_id and community_id are required",
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Check if user exists
    console.log("🔍 Checking if user exists with telegram_id:", telegramUser.telegram_id);
    const { data: existingUser, error: userError } = await supabase
      .from("telegram_mini_app_users")
      .select("*")
      .eq("telegram_id", telegramUser.telegram_id)
      .maybeSingle();

    if (userError) {
      console.error("❌ Error checking for existing user:", userError);
      return new Response(
        JSON.stringify({
          error: "Database error when checking user",
          details: userError.message,
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    console.log("📋 Existing user check result:", existingUser ? "User found" : "User not found");
    let user = existingUser;

    // If user doesn't exist, create new record
    if (!existingUser) {
      console.log("🆕 Creating new user record");
      const insertData = {
        telegram_id: telegramUser.telegram_id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        community_id: body.community_id,
        email: body.email || null
      };
      
      console.log("📝 Insert data:", JSON.stringify(insertData));
      
      const { data: newUser, error: insertError } = await supabase
        .from("telegram_mini_app_users")
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating new user:", insertError);
        return new Response(
          JSON.stringify({
            error: "Failed to create user record",
            details: insertError.message,
            code: insertError.code,
            hint: insertError.hint
          }),
          { headers: corsHeaders, status: 500 }
        );
      }

      console.log("✅ Successfully created user:", JSON.stringify(newUser));
      user = newUser;
    } 
    // Update existing user with latest info
    else {
      console.log("🔄 Updating existing user");
      const updateData = {
        first_name: telegramUser.first_name || existingUser.first_name,
        last_name: telegramUser.last_name || existingUser.last_name,
        username: telegramUser.username || existingUser.username,
        photo_url: telegramUser.photo_url || existingUser.photo_url,
        community_id: body.community_id,
        email: body.email || existingUser.email
      };
      
      console.log("📝 Update data:", JSON.stringify(updateData));
      
      const { data: updatedUser, error: updateError } = await supabase
        .from("telegram_mini_app_users")
        .update(updateData)
        .eq("telegram_id", telegramUser.telegram_id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating user:", updateError);
        // We don't fail the request here, just log the error
        console.log("⚠️ Continuing with existing user data despite update error");
      } else {
        console.log("✅ Successfully updated user:", JSON.stringify(updatedUser));
        user = updatedUser;
      }
    }

    console.log("🏁 Function completed successfully");
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
    console.error("❌ Unhandled server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
        stack: error.stack
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
