
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupMemberCommunities");

export const useGroupMemberCommunities = (groupId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["community-group-members", groupId],
    queryFn: async (): Promise<Community[]> => {
      if (!groupId) {
        logger.log("No group ID provided, returning empty array");
        return [];
      }
      
      try {
        logger.log("Fetching member communities for group ID:", groupId);
        
        // Fetch the communities that are members of this group
        // The relationship is:
        // - community_id = the GROUP ID 
        // - member_id = the COMMUNITY ID that belongs to the group
        const { data: relationships, error: relError } = await supabase
          .from("community_relationships")
          .select(`
            member_id,
            display_order
          `)
          .eq("community_id", groupId) // Filtering by groupId as community_id to get child communities
          .eq("relationship_type", "group");
        
        if (relError) {
          logger.error("Error fetching group member relationships:", relError);
          throw relError;
        }
        
        if (!relationships || relationships.length === 0) {
          logger.log("No member communities found for group", groupId);
          return [];
        }
        
        // Get the actual community details
        const communityIds = relationships.map(rel => rel.member_id);
        logger.log(`Found ${communityIds.length} member communities for group ${groupId}: ${JSON.stringify(communityIds)}`);
        
        const { data: communities, error: comError } = await supabase
          .from("communities")
          .select(`
            *,
            member_count,
            subscription_count
          `)
          .in("id", communityIds);
        
        if (comError) {
          logger.error("Error fetching group member communities:", comError);
          throw comError;
        }
        
        logger.log(`Retrieved ${communities?.length || 0} communities from IDs`);
        
        return communities || [];
      } catch (error) {
        logger.error("Error in useGroupMemberCommunities:", error);
        return []; // Return empty array instead of throwing to prevent infinite loops
      }
    },
    enabled: !!groupId,
    refetchOnWindowFocus: false, // Prevent unexpected refetches
    staleTime: 30000, // Data stays fresh for 30 seconds
    retry: 1, // Only retry once to avoid excessive retries
  });
  
  // Extract just the community IDs for convenience
  const communityIds = data ? data.map(community => community.id) : [];
  
  return {
    communities: data || [],
    isLoading,
    error,
    communityIds
  };
};
