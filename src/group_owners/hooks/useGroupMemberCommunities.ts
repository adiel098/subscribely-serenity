
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
        // Fetch the communities that are members of this group
        const { data: relationships, error: relError } = await supabase
          .from("community_relationships")
          .select(`
            member_id,
            display_order
          `)
          .eq("community_id", groupId)
          .eq("relationship_type", "group")
          .order("display_order");
        
        if (relError) {
          logger.error("Error fetching group member relationships:", relError);
          throw relError;
        }
        
        if (!relationships || relationships.length === 0) {
          return [];
        }
        
        // Get the actual community details
        const communityIds = relationships.map(rel => rel.member_id);
        
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
