
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramUserData {
  telegram_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
  community_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log("🚀 Telegram User Manager function called");

    // Get request body
    const userData: TelegramUserData = await req.json();
    console.log("📋 Received user data:", userData);

    // Validate required fields
    if (!userData.telegram_id) {
      console.error("❌ Missing required field: telegram_id");
      return new Response(
        JSON.stringify({
          error: "Missing required field: telegram_id",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("telegram_mini_app_users")
      .select("*")
      .eq("telegram_id", userData.telegram_id)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Error fetching existing user:", fetchError);
      return new Response(
        JSON.stringify({
          error: `Error fetching existing user: ${fetchError.message}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    let result;

    // Prepare the data to insert/update - exclude undefined values
    const userRecord: any = {
      telegram_id: userData.telegram_id,
      community_id: userData.community_id,
    };

    // Only add fields that are provided
    if (userData.first_name !== undefined) userRecord.first_name = userData.first_name;
    if (userData.last_name !== undefined) userRecord.last_name = userData.last_name;
    if (userData.username !== undefined) userRecord.username = userData.username;
    if (userData.photo_url !== undefined) userRecord.photo_url = userData.photo_url;
    if (userData.email !== undefined) userRecord.email = userData.email;

    console.log("📋 User record to save:", userRecord);

    if (existingUser) {
      console.log("🔄 Updating existing user:", existingUser.id);
      
      // Update only the fields that were provided
      const { data: updatedUser, error: updateError } = await supabase
        .from("telegram_mini_app_users")
        .update(userRecord)
        .eq("telegram_id", userData.telegram_id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Error updating user:", updateError);
        return new Response(
          JSON.stringify({
            error: `Error updating user: ${updateError.message}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      result = updatedUser;
      console.log("✅ User updated successfully:", result);
    } else {
      console.log("➕ Creating new user");
      
      const { data: newUser, error: insertError } = await supabase
        .from("telegram_mini_app_users")
        .insert(userRecord)
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating user:", insertError);
        return new Response(
          JSON.stringify({
            error: `Error creating user: ${insertError.message}`,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      result = newUser;
      console.log("✅ User created successfully:", result);
    }

    return new Response(
      JSON.stringify({
        user: result,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Unhandled error:", error);
    return new Response(
      JSON.stringify({
        error: `Unhandled error: ${error.message}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
