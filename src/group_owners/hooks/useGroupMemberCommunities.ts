
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupMemberCommunities");

export const useGroupMemberCommunities = (groupId: string | null) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["community-group-members", groupId],
    queryFn: async (): Promise<Community[]> => {
      if (!groupId) return [];
      
      try {
        logger.log("Fetching member communities for group ID:", groupId);
        
        // Fetch the communities that are members of this group
        // The critical fix is here: we need to use "community_id" for filtering, not "member_id"
        // In the community_relationships table, community_id is the GROUP and member_id is the COMMUNITY
        const { data: relationships, error: relError } = await supabase
          .from("community_relationships")
          .select(`
            member_id,
            display_order
          `)
          .eq("community_id", groupId) // This is correct - we're looking for communities where this group is the parent
          .eq("relationship_type", "group")
          .order("display_order");
        
        if (relError) {
          logger.error("Error fetching group member relationships:", relError);
          throw relError;
        }
        
        if (!relationships || relationships.length === 0) {
          logger.log("No member communities found for group", groupId);
          return [];
        }
        
        // Get the actual community details - this is where the fix is
        const communityIds = relationships.map(rel => rel.member_id);
        logger.log(`Found ${communityIds.length} member communities for group ${groupId}`);
        
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
        
        return communities || [];
      } catch (error) {
        logger.error("Error in useGroupMemberCommunities:", error);
        throw error;
      }
    },
    enabled: !!groupId,
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
