
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import shared CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Setup Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the bot token
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single();
      
    if (settingsError || !settings?.bot_token) {
      console.error('Failed to retrieve bot token:', settingsError);
      throw new Error('Bot token not found');
    }
    
    const botToken = settings.bot_token.trim();
    console.log('Bot token retrieved (length):', botToken.length);
    
    // Validate that we got a non-empty bot token
    if (!botToken) {
      console.error('Empty bot token retrieved from settings');
      throw new Error('Empty bot token');
    }
    
    // Parse request
    const requestData = await req.json();
    console.log('Request data:', JSON.stringify(requestData));
    
    // Handle bulk photo fetch
    if (requestData.communities && Array.isArray(requestData.communities)) {
      return await handleBulkPhotoFetch(requestData.communities, botToken, supabase);
    }
    
    // Handle single community photo fetch
    const communityId = requestData.communityId;
    const telegramChatId = requestData.telegramChatId;
    const forceFetch = requestData.forceFetch || false;
    
    if (!communityId || !telegramChatId) {
      console.error('Missing required parameters:', { communityId, telegramChatId });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Fetch photo for a single community
    const photoUrl = await fetchCommunityPhoto(telegramChatId, botToken, communityId, supabase, forceFetch);
    
    return new Response(
      JSON.stringify({ photoUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Function to handle bulk photo fetching
async function handleBulkPhotoFetch(communities, botToken, supabase) {
  console.log(`Processing batch of ${communities.length} communities`);
  
  const results = {};
  const errors = [];
  let successCount = 0;
  
  for (const community of communities) {
    try {
      if (!community.id || !community.telegramChatId) {
        console.warn('Skipping community with missing data:', community);
        continue;
      }
      
      const photoUrl = await fetchCommunityPhoto(
        community.telegramChatId, 
        botToken, 
        community.id, 
        supabase, 
        false
      );
      
      if (photoUrl) {
        results[community.id] = photoUrl;
        successCount++;
      }
    } catch (err) {
      console.error(`Error fetching photo for community ${community.id}:`, err);
      errors.push({ communityId: community.id, error: err.message });
    }
  }
  
  console.log(`Fetched ${successCount} photos successfully, ${errors.length} errors`);
  
  return new Response(
    JSON.stringify({ 
      results, 
      errors: errors.length ? errors : undefined,
      message: `Fetched ${successCount} of ${communities.length} community photos` 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Fetch and process community photo
async function fetchCommunityPhoto(chatId, botToken, communityId, supabase, forceFetch = false) {
  try {
    console.log(`Fetching photo for chat ${chatId}, force=${forceFetch}`);
    
    // Check if we have a cached photo URL and are not forcing a refresh
    if (!forceFetch) {
      const { data: community, error: communityError } = await supabase
        .from('communities')
        .select('telegram_photo_url, updated_at')
        .eq('id', communityId)
        .single();
      
      if (communityError) {
        console.error('Error fetching community data:', communityError);
      } else if (community?.telegram_photo_url) {
        const photoAge = new Date() - new Date(community.updated_at);
        const photoAgeHours = photoAge / (1000 * 60 * 60);
        
        // If photo is less than 24 hours old, use cached version
        if (photoAgeHours < 24) {
          console.log(`Using cached photo URL, age: ${photoAgeHours.toFixed(2)} hours`);
          return community.telegram_photo_url;
        }
      }
    }
    
    // Make sure chat ID is properly formatted
    const formattedChatId = chatId.toString().trim();
    console.log(`Requesting photo from Telegram API for chat: ${formattedChatId}`);
    
    // Fetch chat photo from Telegram
    const apiUrl = `https://api.telegram.org/bot${botToken}/getChat`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: formattedChatId })
    });
    
    // Log detailed response information for debugging
    console.log(`Telegram API response status: ${response.status}`);
    const responseText = await response.text();
    console.log(`Telegram API response body: ${responseText}`);
    
    // Parse the response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Telegram API response:', e);
      throw new Error(`Invalid response from Telegram API: ${responseText.substring(0, 100)}`);
    }
    
    // Check for API errors
    if (!data.ok) {
      console.error('Telegram API error:', data.description || 'Unknown error');
      throw new Error(`Telegram API error: ${data.description || 'Unknown error'}`);
    }
    
    // Check if chat has a photo
    if (!data.result?.photo) {
      console.log('No photo available for this chat');
      return null;
    }
    
    // Get photo file ID
    const photoFileId = data.result.photo.big_file_id || data.result.photo.small_file_id;
    if (!photoFileId) {
      console.log('No photo file ID available');
      return null;
    }
    
    // Get file path for the photo
    const filePathResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: photoFileId })
    });
    
    const filePathData = await filePathResponse.json();
    console.log('File path response:', JSON.stringify(filePathData));
    
    if (!filePathData.ok || !filePathData.result?.file_path) {
      console.error('Failed to get file path:', filePathData);
      throw new Error('Failed to get photo file path');
    }
    
    // Construct photo URL
    const photoUrl = `https://api.telegram.org/file/bot${botToken}/${filePathData.result.file_path}`;
    console.log('Photo URL generated:', photoUrl.substring(0, 60) + '...');
    
    // Update the community with the new photo URL
    const { error: updateError } = await supabase
      .from('communities')
      .update({ telegram_photo_url: photoUrl })
      .eq('id', communityId);
    
    if (updateError) {
      console.error('Failed to update community with photo URL:', updateError);
    } else {
      console.log('Successfully updated community with new photo URL');
    }
    
    return photoUrl;
  } catch (error) {
    console.error(`Error fetching photo for chat ${chatId}:`, error);
    throw error;
  }
}
