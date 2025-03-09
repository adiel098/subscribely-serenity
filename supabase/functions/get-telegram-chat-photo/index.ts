
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Bot token not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const { communityId, telegramChatId } = await req.json();
    
    if (!telegramChatId) {
      console.error("Missing telegramChatId parameter");
      return new Response(
        JSON.stringify({ error: "Missing chat ID parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`🔍 Fetching photo for Telegram chat ID: ${telegramChatId}`);
    
    // Call Telegram API to get chat information
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId
      })
    });

    const telegramData = await telegramResponse.json();
    
    if (!telegramData.ok) {
      console.error(`Error fetching chat data: ${telegramData.description}`);
      return new Response(
        JSON.stringify({ error: telegramData.description }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("📋 Telegram API response:", JSON.stringify(telegramData));
    
    let photoUrl = null;
    
    // Check if chat has a photo
    if (telegramData.result.photo) {
      // Get the largest available photo
      const fileId = telegramData.result.photo.big_file_id || 
                     telegramData.result.photo.small_file_id;
      
      if (fileId) {
        // Get file path from Telegram
        const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_id: fileId
          })
        });
        
        const fileData = await fileResponse.json();
        
        if (fileData.ok && fileData.result.file_path) {
          // Construct the direct photo URL
          photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          console.log(`✅ Successfully got photo URL: ${photoUrl}`);
          
          // Update the community record with the photo URL if communityId is provided
          if (communityId) {
            const { error: updateError } = await supabase
              .from('communities')
              .update({ telegram_photo_url: photoUrl })
              .eq('id', communityId);
              
            if (updateError) {
              console.error(`Error updating community record: ${updateError.message}`);
            } else {
              console.log(`✅ Updated community ${communityId} with photo URL`);
            }
          }
        } else {
          console.error("Failed to get file path:", fileData);
        }
      }
    }

    return new Response(
      JSON.stringify({ photoUrl, chatData: telegramData.result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-telegram-chat-photo function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
