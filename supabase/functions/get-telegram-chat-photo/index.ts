
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🚀 get-telegram-chat-photo function started");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("👌 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!botToken) {
      console.error("❌ TELEGRAM_BOT_TOKEN not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Bot token not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    console.log("✅ Environment variables loaded successfully");

    // Parse request body
    const body = await req.json();
    console.log("📦 Request body:", JSON.stringify(body));
    
    const { communityId, telegramChatId, forceFetch = false } = body;
    console.log(`🆔 Community ID: ${communityId || 'Not provided'}`);
    console.log(`🆔 Telegram Chat ID: ${telegramChatId || 'Not provided'}`);
    console.log(`🔄 Force fetch: ${forceFetch}`);
    
    if (!telegramChatId) {
      console.error("❌ Missing telegramChatId parameter");
      return new Response(
        JSON.stringify({ error: "Missing chat ID parameter" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if community already has a photo URL and we're not forcing a fetch
    let existingPhotoUrl = null;
    if (communityId && !forceFetch) {
      console.log("🔍 Checking for existing photo URL in database");
      const { data: communityData } = await supabase
        .from('communities')
        .select('telegram_photo_url')
        .eq('id', communityId)
        .single();
      
      if (communityData?.telegram_photo_url) {
        existingPhotoUrl = communityData.telegram_photo_url;
        console.log(`🖼️ Found existing photo URL: ${existingPhotoUrl}`);
        
        // Verify the URL is still accessible
        try {
          const urlCheck = await fetch(existingPhotoUrl, { method: 'HEAD' });
          if (urlCheck.ok) {
            console.log("✅ Existing photo URL is valid");
            return new Response(
              JSON.stringify({ photoUrl: existingPhotoUrl }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } else {
            console.log("⚠️ Existing photo URL is no longer valid, will fetch new one");
          }
        } catch (error) {
          console.log(`⚠️ Error checking existing URL: ${error.message}`);
        }
      } else {
        console.log("❌ No existing photo URL found in database");
      }
    }

    console.log(`🔍 Fetching photo for Telegram chat ID: ${telegramChatId}`);
    
    // Call Telegram API to get chat information
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    console.log(`📲 Calling Telegram API at: ${telegramApiUrl.replace(botToken, 'REDACTED')}`);
    
    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: telegramChatId
      })
    });

    console.log(`🔄 Telegram API response status: ${telegramResponse.status}`);
    const telegramData = await telegramResponse.json();
    
    console.log(`📋 Telegram API full response:`, JSON.stringify(telegramData, null, 2));
    
    if (!telegramData.ok) {
      console.error(`❌ Error fetching chat data: ${telegramData.description}`);
      console.error(`❌ Error code: ${telegramData.error_code}`);
      return new Response(
        JSON.stringify({ error: telegramData.description }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("✅ Successfully received chat data from Telegram");
    
    let photoUrl = null;
    
    // Check if chat has a photo
    if (telegramData.result.photo) {
      console.log("🖼️ Chat has a photo available");
      // Get the largest available photo
      const fileId = telegramData.result.photo.big_file_id || 
                     telegramData.result.photo.small_file_id;
      
      console.log(`🆔 Photo file ID: ${fileId || 'Not available'}`);
      
      if (fileId) {
        // Get file path from Telegram
        console.log(`🔍 Getting file path for file ID: ${fileId}`);
        const fileApiUrl = `https://api.telegram.org/bot${botToken}/getFile`;
        
        const fileResponse = await fetch(fileApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_id: fileId
          })
        });
        
        console.log(`🔄 File API response status: ${fileResponse.status}`);
        const fileData = await fileResponse.json();
        console.log(`📋 File API response:`, JSON.stringify(fileData, null, 2));
        
        if (fileData.ok && fileData.result.file_path) {
          // Construct the direct photo URL
          photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
          console.log(`✅ Successfully got photo URL: ${photoUrl.replace(botToken, 'REDACTED')}`);
          
          // Update the community record with the photo URL if communityId is provided
          if (communityId) {
            console.log(`🔄 Updating community ${communityId} with photo URL`);
            const { error: updateError } = await supabase
              .from('communities')
              .update({ telegram_photo_url: photoUrl })
              .eq('id', communityId);
              
            if (updateError) {
              console.error(`❌ Error updating community record: ${updateError.message}`, updateError);
            } else {
              console.log(`✅ Successfully updated community ${communityId} with photo URL`);
            }
          } else {
            console.log(`ℹ️ No communityId provided, skipping database update`);
          }
        } else {
          console.error("❌ Failed to get file path:", fileData);
        }
      } else {
        console.log("⚠️ No file ID found in chat photo object");
      }
    } else {
      console.log("ℹ️ Chat does not have a photo");
    }

    console.log(`📤 Returning response with photoUrl: ${photoUrl ? 'Present' : 'Not available'}`);
    return new Response(
      JSON.stringify({ photoUrl, chatData: telegramData.result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Error in get-telegram-chat-photo function:", error);
    console.error("❌ Error stack:", error.stack);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
