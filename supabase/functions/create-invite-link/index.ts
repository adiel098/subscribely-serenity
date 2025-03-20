
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the bot token
    const { data: settings, error: settingsError } = await supabase
      .from('telegram_global_settings')
      .select('bot_token')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (settingsError || !settings?.bot_token) {
      console.error("Failed to get bot token:", settingsError);
      return new Response(
        JSON.stringify({ error: "Failed to get bot token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const botToken = settings.bot_token;
    
    // Get request body
    const { communityId, forceNew = false } = await req.json();
    
    if (!communityId) {
      console.error("Missing community ID");
      return new Response(
        JSON.stringify({ error: "Missing community ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // First check if this is a group
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('id, name, is_group, telegram_invite_link, telegram_chat_id')
      .eq('id', communityId)
      .single();
    
    if (communityError) {
      console.error("Error fetching community:", communityError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch community" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // If we already have an invite link and forceNew is false, return it
    if (!forceNew && community.telegram_invite_link) {
      console.log(`Using existing invite link: ${community.telegram_invite_link}`);
      
      // If this is a group, also fetch its channels
      if (community.is_group) {
        // Fetch channel communities for this group
        const { data: relationships, error: relsError } = await supabase
          .from('community_relationships')
          .select(`
            member_id,
            communities:member_id (
              id, 
              name,
              telegram_invite_link,
              telegram_photo_url
            )
          `)
          .eq('community_id', communityId)
          .eq('relationship_type', 'group');
        
        if (relsError) {
          console.error("Error fetching relationships:", relsError);
        }
        
        // Extract channels with their invite links
        const channels = relationships
          ?.map(rel => rel.communities)
          .filter(Boolean) || [];
        
        return new Response(
          JSON.stringify({
            inviteLink: community.telegram_invite_link,
            isGroup: true,
            groupName: community.name,
            channels: channels
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ inviteLink: community.telegram_invite_link, isGroup: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If no chat ID, we can't create an invite link
    if (!community.telegram_chat_id) {
      console.error("Community has no chat ID");
      return new Response(
        JSON.stringify({ error: "Community has no chat ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Create a new invite link
    const createInviteLinkUrl = `https://api.telegram.org/bot${botToken}/createChatInviteLink`;
    const response = await fetch(createInviteLinkUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: community.telegram_chat_id,
        name: `Auto-generated link for ${community.name}`
      })
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error("Telegram API error:", result);
      return new Response(
        JSON.stringify({ error: "Failed to create invite link via Telegram API" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const inviteLink = result.result.invite_link;
    
    // Update the community with the new invite link
    const { error: updateError } = await supabase
      .from('communities')
      .update({ telegram_invite_link: inviteLink })
      .eq('id', communityId);
    
    if (updateError) {
      console.error("Error updating community:", updateError);
    }
    
    console.log(`Created new invite link: ${inviteLink}`);
    
    // If this is a group, also fetch its channels
    if (community.is_group) {
      // Fetch channel communities for this group
      const { data: relationships, error: relsError } = await supabase
        .from('community_relationships')
        .select(`
          member_id,
          communities:member_id (
            id, 
            name,
            telegram_invite_link,
            telegram_photo_url
          )
        `)
        .eq('community_id', communityId)
        .eq('relationship_type', 'group');
      
      if (relsError) {
        console.error("Error fetching relationships:", relsError);
      }
      
      // Extract channels with their invite links
      const channels = relationships
        ?.map(rel => rel.communities)
        .filter(Boolean) || [];
      
      return new Response(
        JSON.stringify({
          inviteLink: inviteLink,
          isGroup: true,
          groupName: community.name,
          channels: channels
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ inviteLink: inviteLink, isGroup: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
