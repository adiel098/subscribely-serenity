
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { getBotToken } from "../services/botService.ts";
import { getCommunityById, updateCommunityInviteLink, getGroupChannels } from "../services/communityService.ts";
import { createTelegramInviteLink } from "../services/telegramService.ts";
import { corsHeaders } from "../utils/corsHeaders.ts";

/**
 * Handles invite link creation and management
 */
export const handleInviteLink = async (req: Request) => {
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the bot token
    const botToken = await getBotToken(supabase);
    
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
    const community = await getCommunityById(supabase, communityId);
    
    // If we already have an invite link and forceNew is false, return it
    if (!forceNew && community.telegram_invite_link) {
      console.log(`Using existing invite link: ${community.telegram_invite_link}`);
      
      // If this is a group, also fetch its channels
      if (community.is_group) {
        // Fetch channel communities for this group
        const channels = await getGroupChannels(supabase, communityId);
        
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
    const inviteLink = await createTelegramInviteLink(
      botToken, 
      community.telegram_chat_id, 
      `Auto-generated link for ${community.name}`
    );
    
    // Update the community with the new invite link
    await updateCommunityInviteLink(supabase, communityId, inviteLink);
    
    console.log(`Created new invite link: ${inviteLink}`);
    
    // If this is a group, also fetch its channels
    if (community.is_group) {
      // Fetch channel communities for this group
      const channels = await getGroupChannels(supabase, communityId);
      
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
};
