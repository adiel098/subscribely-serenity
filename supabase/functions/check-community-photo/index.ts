
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsOptions } from './utils/cors.ts';
import { fetchCommunityPhoto } from './photoFetcher.ts';
import { handleBulkPhotoFetch } from './bulkPhotoHandler.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsOptions(req);
  if (corsResponse) return corsResponse;

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
