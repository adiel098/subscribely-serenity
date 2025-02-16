
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the community ID from the request
    const { communityId } = await req.json()
    console.log('Creating invite link for community:', communityId)

    if (!communityId) {
      throw new Error('Missing community ID')
    }

    // Get community details and bot token
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single()

    if (communityError || !community) {
      console.error('Error getting community:', communityError)
      throw new Error('Community not found')
    }

    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single()

    if (settingsError || !settings?.bot_token) {
      console.error('Error getting bot token:', settingsError)
      throw new Error('Bot token not found')
    }

    // Create invite link
    const response = await fetch(
      `https://api.telegram.org/bot${settings.bot_token}/createChatInviteLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: community.telegram_chat_id,
          member_limit: 1,
          creates_join_request: true
        })
      }
    )

    const result = await response.json()
    console.log('Invite link creation result:', result)

    if (!result.ok) {
      throw new Error(`Failed to create invite link: ${result.description}`)
    }

    return new Response(
      JSON.stringify({ inviteLink: result.result.invite_link }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
