
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
        logger.log(`Fetching channels for group: ${groupId} using edge function`);
        
        // Call the edge function to get communities in this group
        const { data, error } = await supabase.functions.invoke("get-community-channels", {
          body: { communityId: groupId }
        });
        
        if (error) {
          logger.error("Error fetching group channels from edge function:", error);
          throw error;
        }
        
        if (!data || !data.channels) {
          logger.log("No channels returned from edge function");
          return { channels: [], channelIds: [] };
        }
        
        logger.log(`Retrieved ${data.channels.length} communities from edge function:`, data.channels);
        
        // Since the edge function now returns complete Community objects, we can use them directly
        const communities: Community[] = data.channels;
        
        return { 
          channels: communities,
          channelIds: communities.map(c => c.id)
        };
      } catch (error) {
        logger.error("Error in useGroupChannels:", error);
        return { channels: [], channelIds: [] };
      }
    },
    enabled: !!groupId,
    staleTime: 0, // Set to 0 to always fetch fresh data
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
