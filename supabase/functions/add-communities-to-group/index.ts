
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Get group ID and community IDs from request
    const { groupId, communityIds, userId } = await req.json();
    
    console.log('🔄 Request data:', { groupId, communityIds, userId });
    
    if (!groupId || !communityIds || !Array.isArray(communityIds) || !userId) {
      console.error('❌ Invalid request parameters:', { groupId, communityIds, userId });
      return new Response(
        JSON.stringify({ error: 'groupId, communityIds array, and userId are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify user owns this group
    const { data: group, error: groupError } = await supabase
      .from('communities')
      .select('id, owner_id')
      .eq('id', groupId)
      .eq('is_group', true)
      .single();

    if (groupError) {
      console.error('❌ Group not found:', groupError);
      return new Response(
        JSON.stringify({ error: 'Group not found', details: groupError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check ownership
    if (group.owner_id !== userId) {
      console.error('❌ Permission denied. User is not the owner:', { groupOwnerId: group.owner_id, userId });
      return new Response(
        JSON.stringify({ error: 'You do not have permission to modify this group' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    console.log('✅ Verified ownership. Moving to update relationships');

    // First, clear existing relationships to avoid duplicates (make this operation idempotent)
    const { error: deleteError } = await supabase
      .from('community_relationships')
      .delete()
      .eq('community_id', groupId)
      .eq('relationship_type', 'group');
      
    if (deleteError) {
      console.error('❌ Error clearing existing relationships:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to clear existing relationships', details: deleteError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    } else {
      console.log('✅ Cleared existing relationships successfully');
    }

    // Create batch of group relationships
    // community_id = the GROUP ID
    // member_id = the COMMUNITY ID that belongs to the group
    const groupRelationships = communityIds.map((communityId, index) => ({
      community_id: groupId,
      member_id: communityId,
      display_order: index,
      relationship_type: 'group'
    }));

    console.log('📋 Preparing to insert relationships:', groupRelationships);

    // Insert communities as group members in the new table
    const { data, error } = await supabase
      .from('community_relationships')
      .insert(groupRelationships)
      .select();

    if (error) {
      console.error('❌ Insert error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to add communities to group', 
          details: error 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('✅ Successfully added communities to group:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error adding communities to group:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred', stack: error.stack }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
