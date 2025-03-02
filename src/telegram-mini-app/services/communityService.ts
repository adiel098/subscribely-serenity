
import { logServiceAction, invokeSupabaseFunction } from "./utils/serviceUtils";
import { Community } from "../types/community.types";

export async function searchCommunities(query: string = ""): Promise<Community[]> {
  logServiceAction("searchCommunities", { query });

  try {
    // Get communities with subscription plans and active payment methods
    const { data, error } = await invokeSupabaseFunction("telegram-user-manager", {
      action: "search_communities", 
      query: query, 
      filter_ready: true,
      include_plans: true,  // Explicitly request plans
      debug: true           // Add debug flag for extra logging
    });

    if (error) {
      console.error("Error searching communities:", error);
      throw new Error(error.message);
    }

    // Ensure each community has subscription_plans array
    const communities = data?.communities || [];
    
    // Detailed logging of received data
    console.log(`📋 Received ${communities.length} communities from API`);
    
    communities.forEach((community, index) => {
      if (!community.subscription_plans) {
        console.warn(`⚠️ Community ${community.name} (${community.id}) missing subscription_plans - adding empty array`);
        community.subscription_plans = [];
      } else {
        console.log(`✅ Community ${index + 1}: ${community.name} has ${community.subscription_plans.length} subscription plans`);
        if (community.subscription_plans.length > 0) {
          console.log(`   Plan names: ${community.subscription_plans.map(p => p.name).join(', ')}`);
        }
      }
    });

    logServiceAction("Received communities data", communities);
    return communities;
  } catch (error) {
    console.error("Failed to search communities:", error);
    return [];
  }
}
