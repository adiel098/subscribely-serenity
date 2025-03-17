
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

    // Check if this is a UUID or a custom link
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(communityId);
    
    // First, check if the community exists and whether it's a group
    let communityQuery;
    
    if (isUUID) {
      console.log(`[create-invite-link] Looking up community by UUID: ${communityId}`);
      communityQuery = supabaseAdmin
        .from('communities')
        .select('id, is_group, name, custom_link')
        .eq('id', communityId)
        .single();
    } else {
      console.log(`[create-invite-link] Looking up community by custom link: ${communityId}`);
      communityQuery = supabaseAdmin
        .from('communities')
        .select('id, is_group, name, custom_link')
        .eq('custom_link', communityId)
        .single();
    }
    
    const { data: communityData, error: communityDataError } = await communityQuery;
    
    if (communityDataError) {
      console.error(`[create-invite-link] Error fetching community data: ${communityDataError.message}`)
      return new Response(
        JSON.stringify({ error: `Error fetching community data: ${communityDataError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!communityData) {
      console.error(`[create-invite-link] No community found with identifier: ${communityId}`)
      return new Response(
        JSON.stringify({ error: `No community found with identifier: ${communityId}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const actualCommunityId = communityData.id;
    console.log(`[create-invite-link] Found community: ${communityData.name} (ID: ${actualCommunityId})`);
    
    // If this is a group, handle it differently
    if (communityData?.is_group) {
      console.log(`[create-invite-link] Community ${actualCommunityId} is a group, generating invite links for member communities`)
      
      // Get all member communities in this group
      const { data: memberCommunities, error: memberError } = await supabaseAdmin
        .from('community_relationships')
        .select(`
          member_id,
          member:member_id (
            id,
            name,
            custom_link,
            telegram_chat_id
          )
        `)
        .eq('community_id', actualCommunityId)
        .eq('relationship_type', 'group')
      
      if (memberError) {
        console.error(`[create-invite-link] Error fetching member communities: ${memberError.message}`)
        return new Response(
          JSON.stringify({ error: `Failed to fetch group member communities: ${memberError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      
      // Use bot username for constructing mini app link for the group itself
      const botUsername = "MembifyBot"; // Fallback value
      const groupLinkParam = communityData.custom_link || communityData.id;
      const miniAppLink = `https://t.me/${botUsername}?start=${groupLinkParam}`;
      
      // Create an array of channel info with actual Telegram invite links
      const channelPromises = memberCommunities?.map(async (relation) => {
        const member = relation.member;
        if (!member.telegram_chat_id) {
          // If no telegram_chat_id, use the mini app link as fallback
          const linkParam = member.custom_link || member.id;
          return {
            id: member.id,
            name: member.name,
            inviteLink: `https://t.me/${botUsername}?start=${linkParam}`,
            isMiniApp: true
          };
        }
        
        // Try to create an actual Telegram invite link for this channel
        try {
          // Generate a unique name for the invite link
          const linkName = `Member ${new Date().toISOString().split('T')[0]} ${Math.random().toString(36).substring(2, 8)}`;
          
          const createLinkResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/createChatInviteLink`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: member.telegram_chat_id,
                name: linkName,
                creates_join_request: true,
                // Making the link expire in 30 days
                expire_date: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
              }),
            }
          );
          
          const result = await createLinkResponse.json();
          
          if (!result.ok) {
            console.error(`[create-invite-link] Telegram API error for channel ${member.name}: ${JSON.stringify(result)}`);
            // Fallback to mini app link if Telegram API fails
            const linkParam = member.custom_link || member.id;
            return {
              id: member.id,
              name: member.name,
              inviteLink: `https://t.me/${botUsername}?start=${linkParam}`,
              isMiniApp: true,
              error: result.description
            };
          }
          
          console.log(`[create-invite-link] Created Telegram invite link for channel ${member.name}: ${result.result.invite_link}`);
          
          return {
            id: member.id,
            name: member.name,
            inviteLink: result.result.invite_link,
            isMiniApp: false
          };
        } catch (error) {
          console.error(`[create-invite-link] Error creating invite link for channel ${member.name}:`, error);
          // Fallback to mini app link if an error occurs
          const linkParam = member.custom_link || member.id;
          return {
            id: member.id,
            name: member.name,
            inviteLink: `https://t.me/${botUsername}?start=${linkParam}`,
            isMiniApp: true,
            error: error.message
          };
        }
      }) || [];
      
      // Wait for all invite link creation promises to resolve
      const channelLinks = await Promise.all(channelPromises);
      
      console.log(`[create-invite-link] Returning group link and ${channelLinks.length} channel links`);
      
      // Prepare result object with all invite links in a structured format
      const linksObject = {
        mainGroupLink: miniAppLink,
        isGroup: true,
        groupName: communityData.name,
        channels: channelLinks
      };
      
      return new Response(
        JSON.stringify({ 
          inviteLink: JSON.stringify(linksObject),
          directAccess: linksObject,
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
      // We're not checking for telegram_invite_link in the communities table anymore
      // Instead, we'll try to create a new invite link directly
      const { data: community, error: communityError } = await supabaseAdmin
        .from('communities')
        .select('telegram_chat_id')
        .eq('id', actualCommunityId)
        .single()
      
      if (communityError) {
        console.error(`[create-invite-link] Error fetching community: ${communityError.message}`)
      }
    }

    // Fetch the community details
    const { data: community, error: communityError } = await supabaseAdmin
      .from('communities')
      .select('telegram_chat_id')
      .eq('id', actualCommunityId)
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

    // No longer updating the communities table with the invite link
    // as the column doesn't exist

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
