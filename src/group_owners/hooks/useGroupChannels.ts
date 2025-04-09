
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "./useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useGroupChannels");

interface ChannelsResponse {
  isGroup: boolean;
  channels: Community[];
  error?: string;
}

export const useGroupChannels = (projectId: string | null) => {
  const queryClient = useQueryClient();

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["project-communities", projectId],
    queryFn: async () => {
      if (!projectId) {
        logger.log("No project ID provided");
        return { channels: [], channelIds: [] };
      }
      
      try {
        logger.log(`Fetching channels for project: ${projectId}`);
        
        // Fetch communities that belong to this project
        const { data: communities, error } = await supabase
          .from("communities")
          .select("*")
          .eq("project_id", projectId);
        
        if (error) {
          logger.error("Error fetching project communities:", error);
          return { channels: [], channelIds: [] };
        }
        
        // Debug the raw response data
        logger.debug("Raw communities from project:", communities);
        
        if (!communities || !Array.isArray(communities)) {
          logger.error("No communities returned or invalid format");
          return { channels: [], channelIds: [] };
        }
        
        logger.log(`Retrieved ${communities.length} communities from project ${projectId}`);
        
        // Extract channel IDs
        const channelIds = communities.map(community => community.id);
        logger.log(`Extracted ${channelIds.length} channel IDs:`, channelIds);
        
        return { 
          channels: communities,
          channelIds
        };
      } catch (error) {
        logger.error("Error in useGroupChannels:", error);
        return { channels: [], channelIds: [] };
      }
    },
    enabled: !!projectId,
    staleTime: 0, // Set to 0 to always fetch fresh data
    gcTime: 300000, // 5 minutes garbage collection time
    refetchOnWindowFocus: false
  });
  
  // Log the result every time it changes
  logger.debug("Current useGroupChannels result:", {
    hasResult: !!result,
    channels: result?.channels,
    isArray: result?.channels ? Array.isArray(result.channels) : false,
    length: result?.channels?.length || 0,
    channelIds: result?.channelIds,
    isLoading,
    error
  });
  
  // This function can be called after successful updates to the project communities
  const invalidateCache = () => {
    if (projectId) {
      logger.log(`Invalidating cache for project: ${projectId}`);
      queryClient.invalidateQueries({ queryKey: ["project-communities", projectId] });
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
