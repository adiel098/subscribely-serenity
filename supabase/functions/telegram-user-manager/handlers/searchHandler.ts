
/**
 * Handles searching for communities
 */
export async function handleSearchCommunities(supabase, requestData) {
  const { query, limit = 10 } = requestData;
  console.log(`[telegram-user-manager] Searching communities with query: "${query}"`);

  try {
    let queryBuilder = supabase
      .from("communities")
      .select(`
        id,
        name,
        description,
        telegram_photo_url,
        telegram_invite_link,
        subscription_plans(
          id,
          name,
          description,
          price,
          interval,
          features,
          is_active,
          created_at,
          updated_at
        )
      `)
      .eq("is_group", false);
    
    // Add search condition if query is provided
    if (query && query.trim() !== '') {
      queryBuilder = queryBuilder.ilike("name", `%${query}%`);
    }
    
    // Limit the number of results
    queryBuilder = queryBuilder.limit(limit);
    
    const { data, error } = await queryBuilder;

    if (error) {
      console.error(`[telegram-user-manager] Database error searching communities:`, error);
      throw new Error(`Failed to search communities: ${error.message}`);
    }

    // Only return communities that have active subscription plans
    const communitiesWithPlans = data.filter(community => 
      community.subscription_plans.some(plan => plan.is_active)
    );

    console.log(`[telegram-user-manager] Successfully found ${communitiesWithPlans.length} communities with active plans`);
    return communitiesWithPlans;
  } catch (err) {
    console.error(`[telegram-user-manager] Error in handleSearchCommunities:`, err);
    throw err;
  }
}
