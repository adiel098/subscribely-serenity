
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request
    const { communityId, forceNew = false } = await req.json()
    
    console.log(`[create-invite-link] Creating invite link for community: ${communityId}, forceNew: ${forceNew}`)
    
    if (!communityId) {
      console.error('[create-invite-link] Error: Missing community ID')
      return new Response(
        JSON.stringify({ error: 'Missing community ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { 'X-Client-Info': 'create-invite-link' } } }
    )

    // First, check if the community is a group
    const { data: communityData, error: communityDataError } = await supabaseAdmin
      .from('communities')
      .select('is_group, name, custom_link')
      .eq('id', communityId)
      .single()
    
    if (communityDataError) {
      console.error(`[create-invite-link] Error fetching community data: ${communityDataError.message}`)
      return new Response(
        JSON.stringify({ error: `Error fetching community data: ${communityDataError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // If this is a group, handle it differently
    if (communityData?.is_group) {
      console.log(`[create-invite-link] Community ${communityId} is a group, generating links for member communities`)
      
      // Get all member communities in this group
      const { data: memberCommunities, error: memberError } = await supabaseAdmin
        .from('community_relationships')
        .select(`
          member_id,
          member:member_id (
            id,
            name,
            custom_link
          )
        `)
        .eq('community_id', communityId)
        .eq('relationship_type', 'group')
      
      if (memberError) {
        console.error(`[create-invite-link] Error fetching member communities: ${memberError.message}`)
        return new Response(
          JSON.stringify({ error: `Failed to fetch group member communities: ${memberError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Use bot username for constructing mini app links
      const botUsername = "MembifyBot"; // Fallback value
      
      // For groups, we'll return a deep link to the mini app for this group
      const groupLinkParam = communityData.custom_link || communityId;
      const miniAppLink = `https://t.me/${botUsername}?start=${groupLinkParam}`;
      
      // Create an array of channel info with links
      const channelLinks = memberCommunities?.map(relation => {
        const member = relation.member;
        const linkParam = member.custom_link || member.id;
        const channelLink = `https://t.me/${botUsername}?start=${linkParam}`;
        
        return {
          id: member.id,
          name: member.name,
          inviteLink: channelLink
        };
      }) || [];
      
      console.log(`[create-invite-link] Returning group link and ${channelLinks.length} channel links`);
      
      return new Response(
        JSON.stringify({ 
          inviteLink: miniAppLink,
          isGroup: true,
          groupName: communityData.name,
          channels: channelLinks
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For regular communities (not groups), continue with the existing logic
    // First, check if there's an existing invite link in the community record (unless forceNew is true)
    if (!forceNew) {
      const { data: community, error: communityError } = await supabaseAdmin
        .from('communities')
        .select('telegram_invite_link, telegram_chat_id')
        .eq('id', communityId)
        .single()
      
      if (communityError) {
        console.error(`[create-invite-link] Error fetching community: ${communityError.message}`)
      } else if (community?.telegram_invite_link) {
        console.log(`[create-invite-link] Found existing invite link: ${community.telegram_invite_link}`)
        return new Response(
          JSON.stringify({ inviteLink: community.telegram_invite_link, isGroup: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch the community details
    const { data: community, error: communityError } = await supabaseAdmin
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', communityId)
      .single()

    if (communityError) {
      console.error(`[create-invite-link] Error fetching community: ${communityError.message}`)
      return new Response(
        JSON.stringify({ error: `Error fetching community: ${communityError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!community?.telegram_chat_id) {
      console.error('[create-invite-link] Error: Community has no Telegram chat ID')
      return new Response(
        JSON.stringify({ error: 'Community has no Telegram chat ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch bot token from secrets
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      console.error('[create-invite-link] Error: TELEGRAM_BOT_TOKEN not set')
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate a unique name for the invite link to ensure uniqueness
    const linkName = `Customer ${new Date().toISOString().split('T')[0]} ${Math.random().toString(36).substring(2, 8)}`
    
    // Create a new invite link
    const createLinkResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/createChatInviteLink`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: community.telegram_chat_id,
          name: linkName,
          creates_join_request: true,
          // Making the link expire in 30 days to ensure rotation
          expire_date: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
          // Optional: Set a member limit if desired
          // member_limit: 1,
        }),
      }
    )

    const result = await createLinkResponse.json()
    
    if (!result.ok) {
      console.error(`[create-invite-link] Telegram API error: ${JSON.stringify(result)}`)
      return new Response(
        JSON.stringify({ error: `Failed to create invite link: ${result.description}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const inviteLink = result.result.invite_link
    console.log(`[create-invite-link] Successfully created new invite link: ${inviteLink}`)

    // Update the community record with the new invite link if a column exists
    try {
      const { error: updateError } = await supabaseAdmin
        .from('communities')
        .update({ telegram_invite_link: inviteLink })
        .eq('id', communityId)

      if (updateError) {
        // Column might not exist, just log and continue
        console.log(`[create-invite-link] Note: Could not update community with invite link: ${updateError.message}`)
      }
    } catch (e) {
      // Ignore errors here as the column might not exist
      console.log(`[create-invite-link] Note: Could not update community with invite link: ${e.message}`)
    }

    return new Response(
      JSON.stringify({ inviteLink, isGroup: false }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error(`[create-invite-link] Unexpected error: ${error.message}`)
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
