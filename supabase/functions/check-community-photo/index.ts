
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

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
    console.log("📦 Request body:", JSON.stringify(body));
    
    // Check if we're processing a single community or multiple communities
    if (body.communities && Array.isArray(body.communities)) {
      console.log(`📋 Checking photos for ${body.communities.length} communities`);
      
      const results: Record<string, string> = {};
      
      // Process communities in smaller batches to avoid timeouts
      const batchSize = 5;
      const communities = body.communities;
      
      for (let i = 0; i < communities.length; i += batchSize) {
        const batch = communities.slice(i, i + batchSize);
        console.log(`⏱️ Processing batch ${i/batchSize + 1} with ${batch.length} communities`);
        
        await Promise.all(
          batch.map(async (community: any) => {
            if (!community.id || !community.telegramChatId) {
              console.log(`⚠️ Skipping community with missing data: ${JSON.stringify(community)}`);
              return;
            }
            
            try {
              const photoUrl = await fetchCommunityPhoto(supabase, botToken, community.id, community.telegramChatId);
              
              // Only add to results if photoUrl is not null
              if (photoUrl) {
                results[community.id] = photoUrl;
                console.log(`✅ Got photo for community ${community.id}: ${photoUrl.substring(0, 30)}...`);
              } else {
                console.log(`⚠️ No photo found for community ${community.id}`);
              }
            } catch (err) {
              console.error(`❌ Error processing community ${community.id}:`, err);
              // Continue with other communities even if one fails
            }
          })
        );
      }
      
      console.log(`✅ Completed photo check for ${Object.keys(results).length} communities`);
      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Original single community processing
      const { communityId, telegramChatId, forceFetch = false } = body;
      
      if (!communityId || !telegramChatId) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log(`📋 Checking photo for community ${communityId}, chat ${telegramChatId}`);
      
      const photoUrl = await fetchCommunityPhoto(supabase, botToken, communityId, telegramChatId, forceFetch);
      
      return new Response(
        JSON.stringify({ photoUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("❌ Error in check-community-photo function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function fetchCommunityPhoto(
  supabase: any, 
  botToken: string, 
  communityId: string, 
  telegramChatId: string, 
  forceFetch: boolean = false
) {
  console.log(`🔍 Fetching photo for community ID ${communityId}, chat ID ${telegramChatId}, forceFetch: ${forceFetch}`);
  
  try {
    // Check if community already has a photo URL in the database (if not forcing a fetch)
    let photoUrl = null;
    if (!forceFetch) {
      const { data: communityData, error: dbError } = await supabase
        .from('communities')
        .select('telegram_photo_url')
        .eq('id', communityId)
        .single();
      
      if (dbError) {
        console.error(`❌ Database error when checking existing photo: ${dbError.message}`);
      } else {
        photoUrl = communityData?.telegram_photo_url || null;
        console.log(`🔍 Existing photo URL: ${photoUrl ? "Found" : "Not found"}`);
      }
    } else {
      console.log(`🔄 Force fetch enabled, bypassing database check`);
    }
    
    // If no photo URL exists or if it's not accessible or we're forcing a fetch, fetch a new one
    if (forceFetch || !photoUrl) {
      console.log(`🔄 Fetching new photo from Telegram for chat ${telegramChatId}`);
      
      // Call Telegram API to get chat information
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: telegramChatId })
      });
      
      if (!telegramResponse.ok) {
        const errorText = await telegramResponse.text();
        console.error(`❌ Telegram API error (${telegramResponse.status}): ${errorText}`);
        return null;
      }
      
      const telegramData = await telegramResponse.json();
      console.log(`📋 Telegram getChat response:`, JSON.stringify(telegramData));
      
      if (telegramData.ok && telegramData.result.photo) {
        const fileId = telegramData.result.photo.big_file_id || 
                      telegramData.result.photo.small_file_id;
        
        if (fileId) {
          console.log(`🆔 Found photo file ID: ${fileId}`);
          
          // Get file path from Telegram
          const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_id: fileId })
          });
          
          if (!fileResponse.ok) {
            const fileErrorText = await fileResponse.text();
            console.error(`❌ Telegram file API error (${fileResponse.status}): ${fileErrorText}`);
            return null;
          }
          
          const fileData = await fileResponse.json();
          console.log(`📋 Telegram getFile response:`, JSON.stringify(fileData));
          
          if (fileData.ok && fileData.result.file_path) {
            // Construct the direct photo URL
            photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
            console.log(`✅ Generated photo URL: ${photoUrl.substring(0, 30)}...`);
            
            // Update the community record with the new photo URL
            const { error: updateError } = await supabase
              .from('communities')
              .update({ telegram_photo_url: photoUrl })
              .eq('id', communityId);
              
            if (updateError) {
              console.error(`❌ Error updating community record: ${updateError.message}`);
            } else {
              console.log(`✅ Updated photo URL in database for community ${communityId}`);
            }
          } else {
            console.error(`❌ Invalid file data response:`, JSON.stringify(fileData));
          }
        } else {
          console.error(`❌ No file ID found in chat photo`);
        }
      } else {
        console.log(`ℹ️ Chat ${telegramChatId} does not have a photo or returned invalid data`);
      }
    } else {
      console.log(`✅ Using existing photo URL for community ${communityId}`);
    }
    
    return photoUrl;
  } catch (error) {
    console.error(`❌ Error fetching photo for community ${communityId}:`, error);
    return null;
  }
}
