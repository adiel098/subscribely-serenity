
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { getBotToken } from "../services/botService.ts";
import { getCommunityById, getLatestInviteLink, storeInviteLink, getGroupChannels } from "../services/communityService.ts";
import { createTelegramInviteLink } from "../services/telegramService.ts";
import { corsHeaders } from "../utils/corsHeaders.ts";

/**
 * Handles invite link creation and management
 */
export const handleInviteLink = async (req: Request) => {
  try {
    console.log("Starting invite link handler");
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials in environment");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing Supabase credentials" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("Supabase client created");
    
    // Get request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { communityId, forceNew = false } = requestBody;
    
    if (!communityId) {
      console.error("Missing community ID in request");
      return new Response(
        JSON.stringify({ error: "Missing community ID" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing invite link request for community: ${communityId}, forceNew: ${forceNew}`);
    
    try {
      // Get the bot token
      const botToken = await getBotToken(supabase);
      console.log("Bot token retrieved successfully");
      
      // First check if this is a group
      const community = await getCommunityById(supabase, communityId);
      
      // If we already have an invite link and forceNew is false, return it
      const existingInviteLink = await getLatestInviteLink(supabase, communityId);
      
      if (!forceNew && existingInviteLink) {
        console.log(`Using existing invite link: ${existingInviteLink}`);
        
        // If this is a group, also fetch its channels
        if (community.is_group) {
          // Fetch channel communities for this group
          const channels = await getGroupChannels(supabase, communityId);
          
          return new Response(
            JSON.stringify({
              inviteLink: existingInviteLink,
              isGroup: true,
              groupName: community.name,
              channels: channels
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        return new Response(
          JSON.stringify({ inviteLink: existingInviteLink, isGroup: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // If no chat ID, we can't create an invite link
      if (!community.telegram_chat_id) {
        console.error(`Community ${communityId} has no chat ID`);
        return new Response(
          JSON.stringify({ error: "Community has no chat ID" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Create a new invite link
      console.log(`Creating invite link for chat ID: ${community.telegram_chat_id}`);
      const inviteLink = await createTelegramInviteLink(
        botToken, 
        community.telegram_chat_id, 
        `Auto-generated link for ${community.name}`
      );
      
      // Store the invite link in the subscription_payments table
      console.log(`Created link: ${inviteLink}, storing in subscription_payments`);
      await storeInviteLink(supabase, communityId, inviteLink);
      
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
      console.error("Error in invite link processing:", error instanceof Error ? error.message : error);
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in invite link handler:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};
