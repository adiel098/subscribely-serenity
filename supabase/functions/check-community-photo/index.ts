
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("🔍 check-community-photo function started");
  
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
      console.error("❌ TELEGRAM_BOT_TOKEN not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Bot token not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { communityId, telegramChatId } = body;
    
    if (!communityId || !telegramChatId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`📋 Checking photo for community ${communityId}, chat ${telegramChatId}`);

    // Check if community already has a photo URL in the database
    const { data: communityData } = await supabase
      .from('communities')
      .select('telegram_photo_url')
      .eq('id', communityId)
      .single();
    
    let photoUrl = communityData?.telegram_photo_url || null;
    
    // If no photo URL exists or if it's not accessible, fetch a new one
    if (!photoUrl) {
      console.log("🔄 No existing photo URL found, fetching from Telegram");
      
      // Call Telegram API to get chat information
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId })
      });
      
      const telegramData = await telegramResponse.json();
      
      if (telegramData.ok && telegramData.result.photo) {
        const fileId = telegramData.result.photo.big_file_id || 
                       telegramData.result.photo.small_file_id;
        
        if (fileId) {
          // Get file path from Telegram
          const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_id: fileId })
          });
          
          const fileData = await fileResponse.json();
          
          if (fileData.ok && fileData.result.file_path) {
            // Construct the direct photo URL
            photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
            
            // Update the community record with the new photo URL
            await supabase
              .from('communities')
              .update({ telegram_photo_url: photoUrl })
              .eq('id', communityId);
              
            console.log(`✅ Updated photo URL for community ${communityId}`);
          }
        }
      } else {
        console.log("ℹ️ Chat does not have a photo");
      }
    } else {
      console.log(`✅ Using existing photo URL for community ${communityId}`);
    }

    return new Response(
      JSON.stringify({ photoUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error in check-community-photo function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
