
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("🚀 get-telegram-channel-info function started");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
    
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN is not set in environment variables");
      return new Response(
        JSON.stringify({ error: "Bot token not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const requestData = await req.json();
    const { communityId, chatId } = requestData;
    
    console.log(`🔍 Fetching Telegram channel info for community ID: ${communityId}, chat ID: ${chatId}`);
    
    if (!chatId) {
      console.error("❌ Missing chat_id parameter");
      return new Response(
        JSON.stringify({ error: "Missing chat_id parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Call the Telegram getChat API
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chat_id: chatId })
    });
    
    const telegramData = await telegramResponse.json();
    console.log("📥 Telegram API response:", JSON.stringify(telegramData, null, 2));
    
    if (!telegramData.ok) {
      console.error(`❌ Telegram API error: ${telegramData.description}`);
      return new Response(
        JSON.stringify({ error: `Telegram API error: ${telegramData.description}` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const chatInfo = telegramData.result;
    const description = chatInfo.description || null;
    
    console.log(`📝 Channel description from Telegram: "${description || 'NOT SET'}"`);
    
    // If we have a community ID and description, update it in the database
    if (communityId && description) {
      console.log(`✏️ Updating description for community ${communityId} in database`);
      
      const { data: updateData, error: updateError } = await supabase
        .from('communities')
        .update({ description: description })
        .eq('id', communityId)
        .select('id, name, description');
      
      if (updateError) {
        console.error(`❌ Error updating community description: ${updateError.message}`);
      } else {
        console.log(`✅ Successfully updated community description:`, JSON.stringify(updateData, null, 2));
      }
    }
    
    return new Response(
      JSON.stringify({
        channelInfo: chatInfo,
        description: description,
        updated: communityId ? true : false
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Uncaught error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
