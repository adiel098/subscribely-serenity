
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
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
    console.log('create-invite-link function called')
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase credentials')
      throw new Error('Missing Supabase credentials')
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    )

    // Parse request body
    let requestData
    try {
      requestData = await req.json()
      console.log('Request data received:', requestData)
    } catch (error) {
      console.error('Error parsing request body:', error)
      throw new Error('Invalid request body')
    }

    // Get the community ID from the request
    const { communityId } = requestData
    console.log('Community ID from request:', communityId)

    if (!communityId) {
      console.error('Missing community ID in request')
      return new Response(
        JSON.stringify({ 
          error: 'Missing community ID',
          requestData
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get community details and bot token
    console.log('Fetching community details for ID:', communityId)
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('telegram_chat_id, telegram_invite_link')
      .eq('id', communityId)
      .single()

    if (communityError || !community) {
      console.error('Error getting community:', communityError)
      throw new Error(`Community not found: ${communityError?.message || 'Unknown error'}`)
    }

    console.log('Community details found:', community)

    // If the community already has an invite link, return it instead of creating a new one
    if (community.telegram_invite_link) {
      console.log('Existing invite link found:', community.telegram_invite_link)
      return new Response(
        JSON.stringify({ inviteLink: community.telegram_invite_link, source: 'existing' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Check if the community has a chat ID
    if (!community.telegram_chat_id) {
      console.error('Community has no telegram_chat_id')
      throw new Error('Community chat ID not found')
    }

    console.log('Fetching bot token from settings')
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .single()

    if (settingsError || !settings?.bot_token) {
      console.error('Error getting bot token:', settingsError)
      throw new Error(`Bot token not found: ${settingsError?.message || 'Unknown error'}`)
    }

    console.log('Bot token retrieved successfully')

    // Create invite link with member limit of 1 and no join request approval needed
    console.log('Creating new invite link for chat ID:', community.telegram_chat_id)
    const response = await fetch(
      `https://api.telegram.org/bot${settings.bot_token}/createChatInviteLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: community.telegram_chat_id,
          member_limit: 1
        })
      }
    )

    const result = await response.json()
    console.log('Telegram API response:', result)

    if (!result.ok) {
      console.error('Failed to create invite link:', result.description)
      throw new Error(`Failed to create invite link: ${result.description}`)
    }

    // Save the invite link in the community record
    const inviteLink = result.result.invite_link
    console.log('Saving new invite link to database:', inviteLink)
    
    const { error: updateError } = await supabase
      .from('communities')
      .update({ telegram_invite_link: inviteLink })
      .eq('id', communityId)

    if (updateError) {
      console.error('Error updating community with new invite link:', updateError)
      // We'll still return the link even if saving fails
    }

    return new Response(
      JSON.stringify({ inviteLink, source: 'new' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in create-invite-link function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
