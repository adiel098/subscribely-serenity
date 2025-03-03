
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  community_id?: string;
  debug?: boolean;
  operation?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse the request body
    const { community_id, debug = false, operation = 'get_community_data' } = await req.json() as RequestBody;

    console.log(`[${new Date().toISOString()}] Telegram Community Data request:`, { community_id, operation, debug });

    if (!community_id) {
      console.error('Missing community ID in request');
      return new Response(
        JSON.stringify({ error: 'Missing community ID' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the community data
    if (operation === 'get_community_data' || operation === 'get_invite_link') {
      const { data: community, error } = await supabase
        .from('communities')
        .select('*')
        .eq('id', community_id)
        .single();

      if (error) {
        console.error('Error fetching community:', error);
        return new Response(
          JSON.stringify({ error: `Error fetching community: ${error.message}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      if (!community) {
        console.error('Community not found');
        return new Response(
          JSON.stringify({ error: 'Community not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      console.log('Community data:', community);
      console.log('Invite link from DB:', community.telegram_invite_link);

      // If specifically requesting the invite link, we might need to get it from the Telegram API
      if (operation === 'get_invite_link') {
        // First, check if we already have an invite link
        if (community.telegram_invite_link) {
          console.log('Returning existing invite link:', community.telegram_invite_link);
          return new Response(
            JSON.stringify({ 
              invite_link: community.telegram_invite_link,
              community: community
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // No existing link, we should try to create one
        console.log('No existing invite link found. Consider using the create-invite-link function.');
        
        return new Response(
          JSON.stringify({ 
            error: 'No invite link available',
            community: community,
            invite_link: null,
            message: 'No existing invite link found. Use create-invite-link endpoint to generate one.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return the community data
      return new Response(
        JSON.stringify({ community }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If operation isn't recognized
    return new Response(
      JSON.stringify({ error: `Unknown operation: ${operation}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
