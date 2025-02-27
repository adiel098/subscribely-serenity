
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

function extractInitData(initDataString: string): TelegramInitData {
  if (!initDataString) return {};

  const params = new URLSearchParams(initDataString);
  const user = params.get("user");

  return {
    query_id: params.get("query_id") || undefined,
    user: user ? JSON.parse(decodeURIComponent(user)) : undefined,
    auth_date: params.get("auth_date") ? parseInt(params.get("auth_date")!) : undefined,
    hash: params.get("hash") || undefined,
  };
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { start, initData } = await req.json();

    console.log("Request payload:", { start, initData });

    if (!start) {
      return new Response(
        JSON.stringify({
          error: "Missing start parameter",
        }),
        { headers: { "Content-Type": "application/json" }, status: 400 }
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
          features
        )
      `)
      .eq("id", start)
      .single();

    if (communityError) {
      console.error("Error fetching community:", communityError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch community data",
        }),
        { headers: { "Content-Type": "application/json" }, status: 500 }
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
          const { data: existingUser } = await supabase
            .from("telegram_mini_app_users")
            .select("*")
            .eq("telegram_id", telegramUser.id)
            .single();

          if (!existingUser) {
            // Create new user record
            await supabase.from("telegram_mini_app_users").insert([
              {
                telegram_id: telegramUser.id,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                photo_url: telegramUser.photo_url,
                community_id: start,
              },
            ]);
          } else {
            // Update existing user with latest session info
            await supabase
              .from("telegram_mini_app_users")
              .update({
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                photo_url: telegramUser.photo_url,
                community_id: start,
              })
              .eq("telegram_id", telegramUser.id);
              
            // Include email in userData if available
            if (existingUser.email) {
              userData.email = existingUser.email;
            }
          }
        }
      } catch (error) {
        console.error("Error processing initData:", error);
      }
    }

    return new Response(
      JSON.stringify({
        community,
        user: userData,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
