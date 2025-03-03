
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  community_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Create invite link request received`);

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the Telegram bot token
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (settingsError || !settings?.bot_token) {
      console.error('Error fetching Telegram bot token:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Could not retrieve Telegram bot token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const botToken = settings.bot_token;
    console.log(`[${timestamp}] Bot token retrieved`);

    // Parse the request body
    const { community_id } = await req.json() as RequestBody;

    if (!community_id) {
      console.error('Missing community ID in request');
      return new Response(
        JSON.stringify({ error: 'Missing community ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`[${timestamp}] Processing request for community_id: ${community_id}`);

    // Get the community data
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('telegram_chat_id, telegram_invite_link')
      .eq('id', community_id)
      .single();

    if (communityError || !community) {
      console.error('Error fetching community:', communityError);
      return new Response(
        JSON.stringify({ error: 'Could not retrieve community data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`[${timestamp}] Community data:`, community);
    
    // Check if we already have an invite link
    if (community.telegram_invite_link) {
      console.log(`[${timestamp}] Community already has invite link:`, community.telegram_invite_link);
      return new Response(
        JSON.stringify({ invite_link: community.telegram_invite_link }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // We need the chat ID to create an invite link
    if (!community.telegram_chat_id) {
      console.error('Community does not have a Telegram chat ID');
      return new Response(
        JSON.stringify({ error: 'Community does not have a Telegram chat ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`[${timestamp}] Creating invite link for chat ID: ${community.telegram_chat_id}`);

    // Create an invite link using the Telegram Bot API
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/createChatInviteLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: community.telegram_chat_id,
          name: `Membify Auto-Generated Link ${new Date().toISOString()}`,
          creates_join_request: false,
        }),
      }
    );

    const telegramData = await telegramResponse.json();
    console.log(`[${timestamp}] Telegram API response:`, telegramData);

    if (!telegramData.ok) {
      console.error('Error creating invite link:', telegramData.description);
      return new Response(
        JSON.stringify({ error: `Telegram API error: ${telegramData.description}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const inviteLink = telegramData.result.invite_link;
    console.log(`[${timestamp}] Created invite link: ${inviteLink}`);

    // Update the community with the new invite link
    const { error: updateError } = await supabase
      .from('communities')
      .update({ telegram_invite_link: inviteLink })
      .eq('id', community_id);

    if (updateError) {
      console.error('Error updating community with new invite link:', updateError);
      // We'll still return the invite link even if we couldn't update the DB
    } else {
      console.log(`[${timestamp}] Updated community in database with new invite link`);
    }

    return new Response(
      JSON.stringify({ invite_link: inviteLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating invite link:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
