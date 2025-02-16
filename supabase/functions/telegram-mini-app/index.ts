
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('start');
    const telegramInitData = searchParams.get('initData');

    if (!startParam) {
      return new Response(
        JSON.stringify({ error: 'Missing start parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get community details based on the start parameter
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select(`
        id,
        name,
        description,
        subscription_plans (
          id,
          name,
          description,
          price,
          interval,
          features
        )
      `)
      .eq('id', startParam)
      .single();

    if (communityError || !community) {
      console.error('Error fetching community:', communityError);
      return new Response(
        JSON.stringify({ error: 'Community not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Parse Telegram init data if available
    let telegramUser = null;
    if (telegramInitData) {
      try {
        const decodedData = new URLSearchParams(telegramInitData);
        const userStr = decodedData.get('user');
        if (userStr) {
          telegramUser = JSON.parse(userStr);
        }
      } catch (error) {
        console.error('Error parsing Telegram init data:', error);
      }
    }

    // Return community and subscription plan details
    return new Response(
      JSON.stringify({
        community,
        telegramUser,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
