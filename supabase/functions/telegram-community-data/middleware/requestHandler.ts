
import { logger } from '../utils/logger.ts';
import { createErrorResponse, createNotFoundResponse, createSuccessResponse } from '../utils/response.ts';
import { 
  fetchCommunityById, 
  fetchSubscriptionPlans, 
  verifyPlansCount,
  fetchGroupMemberCommunities
} from '../services/communityService.ts';
import { createSupabaseClient } from '../utils/database.ts';

export interface CommunityRequestPayload {
  community_id?: string;
  group_id?: string;
  debug?: boolean;
  fetch_telegram_data?: boolean;
}

/**
 * Process the community data request and return appropriate response
 */
export async function handleCommunityRequest(payload: CommunityRequestPayload) {
  const { community_id, group_id, debug } = payload || {};
  const idToUse = community_id || group_id;
  
  // Log request details
  logger.debug("Request payload:", payload);
  logger.info(`Processing request for ID: ${idToUse}`);

  // Validate required parameters
  if (!idToUse) {
    logger.error("Missing required parameter: community_id or group_id");
    return createErrorResponse("Missing required parameter: community_id or group_id", null, 400);
  }
  
  // Initialize Supabase client
  let supabase;
  try {
    supabase = createSupabaseClient();
    logger.debug("Supabase client initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize Supabase client:", error);
    return createErrorResponse("Server configuration error: Unable to initialize database connection");
  }

  // Check if this is a UUID or custom link
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idToUse);
  
  try {
    // Fetch the community data
    const community = await fetchCommunityById(idToUse, isUuid);
    
    if (!community) {
      return createNotFoundResponse(`Community not found with identifier: ${idToUse}`);
    }
    
    // Fetch subscription plans separately for proper filtering
    community.subscription_plans = await fetchSubscriptionPlans(supabase, community.id);
    
    // Verify plans count for debugging purposes
    await verifyPlansCount(supabase, community.id);
    
    // If this is a group, fetch its member communities
    if (community.is_group) {
      // Get member communities
      community.communities = await fetchGroupMemberCommunities(supabase, community.id);
    }
    
    // Update community with platform URLs
    community.platform_url = "https://preview--subscribely-serenity.lovable.app";
    community.miniapp_url = "https://preview--subscribely-serenity.lovable.app/telegram-mini-app";
    
    // Log the final response data
    logger.debug(`Final response data:`, JSON.stringify({ community }));
    
    return createSuccessResponse({ community });
  } catch (error) {
    logger.error(`Error executing database query: ${error.message}`, error);
    return createErrorResponse(`Error executing database query: ${error.message}`, error);
  }
}
