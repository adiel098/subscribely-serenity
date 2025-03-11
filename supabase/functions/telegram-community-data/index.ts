
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from './utils/cors.ts';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from './utils/response.ts';
import { fetchCommunityData } from './utils/database.ts';
import { logger } from './utils/logger.ts';

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS pre-flight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logger.info('Received request');
    const { community_id, group_id, debug, fetch_telegram_data } = await req.json();
    
    if (debug) {
      logger.debug('Request payload:', { community_id, group_id, fetch_telegram_data });
    }
    
    // If we have a group_id, handle group data fetching
    if (group_id) {
      return await handleGroupData(group_id);
    }
    
    // Handle regular community data
    if (!community_id) {
      logger.error('Missing community_id parameter');
      return createErrorResponse('Missing required parameter: community_id', null, 400);
    }

    // Check if ID is UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(community_id);
    logger.info(`Fetching community data for ${isUUID ? 'ID' : 'custom link'}: ${community_id}`);
    
    // Fetch community data
    const { data: community, error } = await fetchCommunityData(supabase, { 
      communityId: community_id, 
      isUUID 
    });
    
    if (error) {
      logger.error(`Error fetching community: ${error.message}`);
      return createErrorResponse('Failed to fetch community data', error, 500);
    }

    if (!community) {
      logger.warn(`Community not found: ${community_id}`);
      return createNotFoundResponse(`Community not found with ${isUUID ? 'ID' : 'custom link'}: ${community_id}`);
    }

    // Fetch subscription plans
    const { data: subscriptionPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('community_id', community.id)
      .eq('is_active', true);
    
    if (plansError) {
      logger.error(`Error fetching subscription plans: ${plansError.message}`);
      return createErrorResponse('Failed to fetch subscription plans', plansError, 500);
    }

    // Combine the data and return
    const response = {
      community: {
        ...community,
        subscription_plans: subscriptionPlans || []
      }
    };

    logger.success('Successfully returned community data');
    return createSuccessResponse(response);
    
  } catch (error) {
    logger.error('Unexpected error:', error);
    return createErrorResponse('Internal server error', error, 500);
  }
});

/**
 * Handle group data fetching and processing
 */
async function handleGroupData(groupId: string) {
  try {
    logger.info(`Fetching group data for ID: ${groupId}`);
    
    // Check if ID is UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId);
    
    // First, resolve the ID if it's a custom link
    let resolvedGroupId = groupId;
    if (!isUUID) {
      logger.debug(`Looking up group by custom link: ${groupId}`);
      const { data: groupData, error: groupLinkError } = await supabase
        .from('community_groups')
        .select('id')
        .eq('custom_link', groupId)
        .single();
      
      if (groupLinkError || !groupData) {
        logger.error(`Group not found with custom link: ${groupId}`);
        return createNotFoundResponse(`Group not found with custom link: ${groupId}`);
      }
      
      resolvedGroupId = groupData.id;
      logger.debug(`Resolved custom link to group ID: ${resolvedGroupId}`);
    }
    
    // Fetch the group data
    const { data: group, error: groupError } = await supabase
      .from('community_groups')
      .select('*')
      .eq('id', resolvedGroupId)
      .single();
    
    if (groupError || !group) {
      logger.error(`Error fetching group: ${groupError?.message || 'Group not found'}`);
      return createNotFoundResponse(`Group not found with ID: ${resolvedGroupId}`);
    }
    
    // Fetch the communities in this group
    const { data: groupMembers, error: membersError } = await supabase
      .from('community_group_members')
      .select('community_id')
      .eq('group_id', group.id)
      .order('display_order', { ascending: true });
    
    if (membersError) {
      logger.error(`Error fetching group members: ${membersError.message}`);
      return createErrorResponse('Failed to fetch group members', membersError, 500);
    }
    
    if (!groupMembers || groupMembers.length === 0) {
      logger.warn(`Group has no communities: ${group.id}`);
      // Return the group without communities
      return createSuccessResponse({ 
        community: { 
          ...group, 
          is_group: true,
          subscription_plans: []
        } 
      });
    }
    
    // Fetch communities
    const communityIds = groupMembers.map(member => member.community_id);
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('*')
      .in('id', communityIds);
    
    if (communitiesError) {
      logger.error(`Error fetching communities for group: ${communitiesError.message}`);
      return createErrorResponse('Failed to fetch communities for group', communitiesError, 500);
    }
    
    // Fetch all subscription plans for these communities
    const { data: subscriptionPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .in('community_id', communityIds)
      .eq('is_active', true);
    
    if (plansError) {
      logger.error(`Error fetching subscription plans: ${plansError.message}`);
      return createErrorResponse('Failed to fetch subscription plans', plansError, 500);
    }
    
    // Create a synthetic "community" object that represents the group
    const response = {
      community: {
        ...group,
        is_group: true,
        communities: communities || [],
        subscription_plans: subscriptionPlans || []
      }
    };
    
    logger.success('Successfully returned group data');
    return createSuccessResponse(response);
    
  } catch (error) {
    logger.error('Error in handleGroupData:', error);
    return createErrorResponse('Failed to process group data', error, 500);
  }
}
