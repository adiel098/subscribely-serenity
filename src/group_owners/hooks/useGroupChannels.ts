
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
        logger.log("No group ID provided");
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
        
        // Ensure we have valid data
        if (!data) {
          logger.error("No data returned from edge function");
          return { channels: [], channelIds: [] };
        }
        
        // Check if data has the channels array
        let channels: Community[] = [];
        
        if (data.channels && Array.isArray(data.channels)) {
          logger.log(`Retrieved ${data.channels.length} communities from edge function:`, data.channels);
          channels = data.channels;
        } else {
          logger.error("Invalid channels data format:", data);
        }
        
        // Extract channel IDs
        const channelIds = channels.map(channel => channel.id);
        logger.log(`Extracted ${channelIds.length} channel IDs:`, channelIds);
        
        return { 
          channels,
          channelIds
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
