
import { logServiceAction, invokeSupabaseFunction } from "./utils/serviceUtils";
import { Community } from "../types/community.types";

export async function searchCommunities(query: string = ""): Promise<Community[]> {
  logServiceAction("searchCommunities", { query });

  try {
    // Get communities with subscription plans and active payment methods
    const { data, error } = await invokeSupabaseFunction("telegram-user-manager", {
      action: "search_communities", 
      query: query, 
      filter_ready: true
    });

    if (error) {
      console.error("Error searching communities:", error);
      throw new Error(error.message);
    }

    logServiceAction("Received communities data", data);
    return data?.communities || [];
  } catch (error) {
    console.error("Failed to search communities:", error);
    return [];
  }
}
