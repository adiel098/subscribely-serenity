
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
    
    if (!groupId || !communityIds || !Array.isArray(communityIds) || !userId) {
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
      return new Response(
        JSON.stringify({ error: 'Group not found', details: groupError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check ownership
    if (group.owner_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'You do not have permission to modify this group' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // First, clear existing members to avoid duplicates (make this operation idempotent)
    await supabase
      .from('community_group_members')
      .delete()
      .eq('parent_id', groupId)
      .in('community_id', communityIds);

    // Create batch of group members
    const groupMembers = communityIds.map((communityId, index) => ({
      parent_id: groupId,
      community_id: communityId,
      display_order: index
    }));

    // Insert communities as group members
    const { data, error } = await supabase
      .from('community_group_members')
      .insert(groupMembers)
      .select();

    if (error) {
      console.error('Insert error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to add communities to group', 
          details: error 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error adding communities to group:', error)
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred', stack: error.stack }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
