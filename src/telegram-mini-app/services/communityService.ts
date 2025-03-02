
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
      include_plans: true  // Explicitly request plans
    });

    if (error) {
      console.error("Error searching communities:", error);
      throw new Error(error.message);
    }

    // Ensure each community has subscription_plans array
    const communities = data?.communities || [];
    communities.forEach(community => {
      if (!community.subscription_plans) {
        community.subscription_plans = [];
      }
    });

    logServiceAction("Received communities data", communities);
    return communities;
  } catch (error) {
    console.error("Failed to search communities:", error);
    return [];
  }
}
