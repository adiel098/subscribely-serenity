
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./types/memberTypes";

/**
 * Searches for communities with subscription plans and active payment methods
 * @param query Optional search query string
 * @returns Array of communities matching the search criteria
 */
export async function searchCommunities(query: string = ""): Promise<Community[]> {
  console.log("Searching communities with query:", query);

  try {
    // Get communities with subscription plans and active payment methods
    const { data, error } = await supabase.functions.invoke("telegram-user-manager", {
      body: { action: "search_communities", query: query, filter_ready: true }
    });

    if (error) {
      console.error("Error searching communities:", error);
      throw new Error(error.message);
    }

    console.log("Received communities data:", data);
    return data?.communities || [];
  } catch (error) {
    console.error("Failed to search communities:", error);
    return [];
  }
}
