
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupChannels");

export const useGroupChannels = (groupId: string | null) => {
  const queryClient = useQueryClient();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["community-group-members", groupId],
    queryFn: async () => {
      if (!groupId) {
        return { channels: [], channelIds: [] };
      }
      
      try {
        logger.log(`Fetching channels for group: ${groupId}`);
        
        // Use community_relationships table to get all members of this group
        const { data: relationships, error } = await supabase
          .from("community_relationships")
          .select("member_id")
          .eq("community_id", groupId)
          .eq("relationship_type", "group");
          
        if (error) {
          logger.error("Error fetching group members:", error);
          throw error;
        }
        
        if (!relationships || relationships.length === 0) {
          return { channels: [], channelIds: [] };
        }
        
        // Extract community IDs from relationships
        const communityIds = relationships.map(rel => rel.member_id);
        
        // Fetch the actual community details
        const { data: communities, error: communitiesError } = await supabase
          .from("communities")
          .select("*")
          .in("id", communityIds);
          
        if (communitiesError) {
          logger.error("Error fetching group member communities:", communitiesError);
          throw communitiesError;
        }
        
        return { 
          channels: communities as Community[] || [],
          channelIds: communityIds
        };
      } catch (error) {
        logger.error("Error in useGroupChannels:", error);
        return { channels: [], channelIds: [] };
      }
    },
    enabled: !!groupId,
    staleTime: 30000, // 30 second cache to reduce unnecessary fetches but still get updated data relatively quickly
    gcTime: 300000, // 5 minutes garbage collection time
    refetchOnWindowFocus: false
  });
  
  // This function can be called after successful updates to the group communities
  const invalidateCache = () => {
    if (groupId) {
      logger.log(`Invalidating cache for group: ${groupId}`);
      queryClient.invalidateQueries({ queryKey: ["community-group-members", groupId] });
    }
  };
  
  return {
    channels: result?.channels || [],
    channelIds: result?.channelIds || [],
    isLoading,
    error,
    invalidateCache
  };
};
