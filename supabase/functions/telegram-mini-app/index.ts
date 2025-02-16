
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

    // Get request body
    const { start, initData } = await req.json();
    console.log('Received parameters:', { start, initData });

    if (!start) {
      return new Response(
        JSON.stringify({ error: 'Missing start parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Fetching community with ID:', start);
    
    // Get community details based on the start parameter
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_invite_link,
        subscription_plans (
          id,
          name,
          description,
          price,
          interval,
          features,
          community_id
        )
      `)
      .eq('id', start)
      .single();

    console.log('Query result:', { community, error: communityError });

    if (communityError || !community) {
      console.error('Error fetching community:', communityError);
      return new Response(
        JSON.stringify({ error: 'Community not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // עדכון תוכניות המנוי עם ה-community_id
    const plansWithCommunityId = community.subscription_plans.map(plan => ({
      ...plan,
      community_id: community.id
    }));

    const communityWithUpdatedPlans = {
      ...community,
      subscription_plans: plansWithCommunityId
    };

    // Parse Telegram init data if available
    let telegramUser = null;
    if (initData) {
      try {
        const decodedData = new URLSearchParams(initData);
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
        community: communityWithUpdatedPlans,
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
