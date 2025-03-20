
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
    
    // Get request body
    const { communityId } = await req.json();
    
    if (!communityId) {
      console.log("Error: Missing community ID");
      return new Response(
        JSON.stringify({ error: "Missing community ID", isGroup: false, channels: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Fetching data for community ID: ${communityId}`);
    
    // Get community info to check if it's a group
    const { data: community, error: communityError } = await supabase
      .from("communities")
      .select("id, name, is_group")
      .eq("id", communityId)
      .maybeSingle();
      
    if (communityError) {
      console.error("Error fetching community:", communityError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch community data", isGroup: false, channels: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // If community doesn't exist, return empty array
    if (!community) {
      console.log(`Community ${communityId} not found`);
      return new Response(
        JSON.stringify({ error: "Community not found", isGroup: false, channels: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Check if it's a group
    if (!community.is_group) {
      console.log(`Community ${communityId} is not a group`);
      return new Response(
        JSON.stringify({ isGroup: false, channels: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get member communities for this group from community_relationships table
    // In this table, community_id is the GROUP ID, and member_id is the COMMUNITY ID
    console.log(`Querying community_relationships where community_id = ${communityId} and relationship_type = 'group'`);
    
    const { data: relationships, error: relationshipsError } = await supabase
      .from("community_relationships")
      .select(`
        member_id,
        communities:member_id (
          id, 
          name,
          description,
          telegram_chat_id,
          telegram_photo_url,
          custom_link,
          owner_id,
          created_at,
          updated_at,
          is_group
        )
      `)
      .eq("community_id", communityId)
      .eq("relationship_type", "group");
      
    if (relationshipsError) {
      console.error("Error fetching relationships:", relationshipsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch group relationships", isGroup: true, channels: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log("Raw relationships data:", JSON.stringify(relationships));
    
    if (!relationships || !Array.isArray(relationships)) {
      console.error("Relationships is not an array or null:", relationships);
      return new Response(
        JSON.stringify({ isGroup: true, channels: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Process relationships into channels format
    let channels = [];
    
    if (relationships && Array.isArray(relationships)) {
      channels = relationships
        .filter(rel => rel.communities) // Filter out any null communities
        .map(rel => rel.communities); // Return the complete community object
      
      console.log(`Mapped ${channels.length} channels from relationships`);
    } else {
      console.error("Relationships is not an array or is null:", relationships);
    }
    
    // Double check that channels is an array
    if (!Array.isArray(channels)) {
      console.error("Warning: channels is not an array after mapping!", channels);
      channels = []; // Ensure we always return an array
    }
    
    // Filter out any null entries
    channels = channels.filter(channel => channel !== null && typeof channel === 'object');
    
    // Now get invite links from subscription_payments table for each channel
    const enrichedChannels = await Promise.all(channels.map(async (channel) => {
      // Get the most recent invite link for this community
      const { data: payment, error: linkError } = await supabase
        .from('subscription_payments')
        .select('invite_link')
        .eq('community_id', channel.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (linkError) {
        console.warn(`Error fetching invite link for channel ${channel.id}:`, linkError);
      }
      
      return {
        ...channel,
        telegram_invite_link: payment?.invite_link || null
      };
    }));
    
    console.log(`Found ${enrichedChannels.length} channels for group ${communityId}`);
    console.log("Enriched channels data:", JSON.stringify(enrichedChannels));
    
    return new Response(
      JSON.stringify({ 
        isGroup: true, 
        channels: enrichedChannels 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", isGroup: false, channels: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
