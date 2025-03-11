
import { logServiceAction, invokeSupabaseFunction } from "./utils/serviceUtils";
import { Community } from "../types/community.types";
import { toast } from "@/hooks/use-toast";

export async function searchCommunities(query: string = ""): Promise<Community[]> {
  logServiceAction("🔍 searchCommunities", { query });

  try {
    // Create payload with detailed logging
    const payload = {
      action: "search_communities", 
      query: query, 
      filter_ready: true,
      include_plans: true,  
      debug: true           
    };
    console.log("📤 Sending to edge function:", payload);
    
    const { data, error } = await invokeSupabaseFunction("telegram-user-manager", payload);

    if (error) {
      console.error("❌ Error searching communities:", error);
      toast({
        title: "Search Error",
        description: "Could not retrieve communities. Please try again later.",
        variant: "destructive"
      });
      throw new Error(error.message);
    }

    // Ensure each community has subscription_plans array
    const communities = data?.communities || [];
    
    // Log metadata information if available
    if (data?.metadata) {
      console.log("📊 Search metadata:", data.metadata);
      console.log(`🔍 Found ${data.metadata.total_found} communities, ${data.metadata.eligible_count} eligible after filtering`);
    }
    
    // Detailed logging of received data
    console.log(`📋 Received ${communities.length} communities from API`);
    
    communities.forEach((community: Community, index: number) => {
      if (!community.subscription_plans) {
        console.warn(`⚠️ Community ${community.name} (${community.id}) missing subscription_plans - adding empty array`);
        community.subscription_plans = [];
      } else if (!Array.isArray(community.subscription_plans)) {
        console.error(`❌ Community ${community.name} (${community.id}) has non-array subscription_plans:`, community.subscription_plans);
        console.log("Type of subscription_plans:", typeof community.subscription_plans);
        community.subscription_plans = [];
      } else {
        console.log(`✅ Community ${index + 1}: ${community.name} has ${community.subscription_plans.length} subscription plans`);
      }
    });

    logServiceAction("✅ Processed communities data", communities);
    return communities;
  } catch (error) {
    console.error("❌ Failed to search communities:", error);
    return [];
  }
}

export async function fetchGroupData(groupId: string): Promise<Community | null> {
  logServiceAction("🔍 fetchGroupData", { groupId });

  try {
    const payload = {
      group_id: groupId,
      debug: true,
      fetch_telegram_data: true
    };
    console.log("📤 Sending to edge function:", payload);
    
    const { data, error } = await invokeSupabaseFunction("telegram-community-data", payload);

    if (error) {
      console.error("❌ Error fetching group data:", error);
      toast({
        title: "Error",
        description: "Could not retrieve group data. Please try again later.",
        variant: "destructive"
      });
      throw new Error(error.message);
    }

    if (!data?.community) {
      console.error("❌ No group data found:", data);
      return null;
    }

    // Process the community data
    const community = data.community;
    
    // Ensure subscription_plans is always an array
    if (!community.subscription_plans) {
      console.warn(`⚠️ Group ${community.name} missing subscription_plans - adding empty array`);
      community.subscription_plans = [];
    } else if (!Array.isArray(community.subscription_plans)) {
      console.error(`❌ Group ${community.name} has non-array subscription_plans:`, community.subscription_plans);
      community.subscription_plans = [];
    }
    
    // Ensure communities is always an array if this is a group
    if (community.is_group && !community.communities) {
      console.warn(`⚠️ Group ${community.name} missing communities array - adding empty array`);
      community.communities = [];
    } else if (community.is_group && !Array.isArray(community.communities)) {
      console.error(`❌ Group ${community.name} has non-array communities:`, community.communities);
      community.communities = [];
    }

    logServiceAction("✅ Processed group data", community);
    return community;
  } catch (error) {
    console.error("❌ Failed to fetch group data:", error);
    return null;
  }
}
