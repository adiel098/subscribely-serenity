
/**
 * Search for communities with filtering based on subscription plans, payment methods and owner subscription
 */
export async function handleSearchCommunities(supabase, data) {
  const { query = "", filter_ready = true, include_plans = true, debug = false } = data;
  
  console.log(`[telegram-user-manager] Searching communities with query: "${query}"`);
  console.log(`[telegram-user-manager] Additional filters: ready=${filter_ready}, include_plans=${include_plans}`);
  
  try {
    // Build the search query with our filters
    let queryBuilder = supabase
      .from('communities')
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_invite_link,
        telegram_chat_id,
        member_count,
        custom_link,
        owner_id
      `);
    
    // Apply name search filter if provided
    if (query && query.trim() !== '') {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }
    
    const { data: communities, error } = await queryBuilder;
    
    if (error) {
      console.error(`[telegram-user-manager] Database error:`, error);
      throw new Error(`Failed to search communities: ${error.message}`);
    }
    
    console.log(`[telegram-user-manager] Found ${communities.length} communities before filtering`);
    
    // If no additional filtering required, return all found communities
    if (!filter_ready) {
      return { communities };
    }
    
    // Get all eligible communities after applying our criteria
    const eligibleCommunities = await Promise.all(
      communities.map(async (community) => {
        // Apply the filtering criteria
        const isEligible = await checkCommunityEligibility(supabase, community, debug);
        
        if (!isEligible) {
          return null;
        }
        
        // If we need to include plans, fetch all active plans
        if (include_plans) {
          community.subscription_plans = await fetchCommunityPlans(supabase, community.id);
        } else {
          community.subscription_plans = [];
        }
        
        return community;
      })
    );
    
    // Filter out null values (communities that didn't meet criteria)
    const filteredCommunities = eligibleCommunities.filter(community => community !== null);
    
    console.log(`[telegram-user-manager] Returning ${filteredCommunities.length} eligible communities after filtering`);
    
    return { 
      communities: filteredCommunities,
      metadata: {
        total_found: communities.length,
        eligible_count: filteredCommunities.length,
        query: query,
        filters_applied: filter_ready
      }
    };
  } catch (err) {
    console.error(`[telegram-user-manager] Error in handleSearchCommunities:`, err);
    throw err;
  }
}

/**
 * Check if a community meets all eligibility criteria
 */
async function checkCommunityEligibility(supabase, community, debug = false) {
  // Check #1: Community must have at least one active payment method
  const { data: paymentMethods, error: paymentError } = await supabase
    .from('payment_methods')
    .select('id')
    .eq('community_id', community.id)
    .eq('is_active', true)
    .limit(1);
    
  if (paymentError) {
    console.error(`[telegram-user-manager] Error checking payment methods:`, paymentError);
    return false;
  }
  
  if (!paymentMethods || paymentMethods.length === 0) {
    if (debug) console.log(`[telegram-user-manager] Community ${community.id} filtered out: no active payment methods`);
    return false;
  }
  
  // Check #2: Community must have at least one active subscription plan
  const { data: subscriptionPlans, error: plansError } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('community_id', community.id)
    .eq('is_active', true)
    .limit(1);
    
  if (plansError) {
    console.error(`[telegram-user-manager] Error checking subscription plans:`, plansError);
    return false;
  }
  
  if (!subscriptionPlans || subscriptionPlans.length === 0) {
    if (debug) console.log(`[telegram-user-manager] Community ${community.id} filtered out: no active subscription plans`);
    return false;
  }
  
  // Check #3: Community owner must have an active platform subscription
  const { data: ownerSubscription, error: ownerSubError } = await supabase
    .from('platform_subscriptions')
    .select('id')
    .eq('owner_id', community.owner_id)
    .eq('status', 'active')
    .limit(1);
    
  if (ownerSubError) {
    console.error(`[telegram-user-manager] Error checking owner subscription:`, ownerSubError);
    return false;
  }
  
  if (!ownerSubscription || ownerSubscription.length === 0) {
    if (debug) console.log(`[telegram-user-manager] Community ${community.id} filtered out: owner has no active platform subscription`);
    return false;
  }
  
  // If community passed all checks, it's eligible
  if (debug) console.log(`[telegram-user-manager] Community ${community.id} passed all filters`);
  return true;
}

/**
 * Fetch all active subscription plans for a community
 */
async function fetchCommunityPlans(supabase, communityId) {
  const { data: allPlans, error: allPlansError } = await supabase
    .from('subscription_plans')
    .select('id, name, description, price, interval, features, is_active, created_at, updated_at')
    .eq('community_id', communityId)
    .eq('is_active', true);
    
  if (allPlansError) {
    console.error(`[telegram-user-manager] Error fetching all plans:`, allPlansError);
    return [];
  }
  
  return allPlans || [];
}
