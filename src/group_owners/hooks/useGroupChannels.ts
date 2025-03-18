
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
          return { channels: [], channelIds: [] };
        }
        
        // Debug the raw response data
        logger.debug("Raw response from edge function:", data);
        
        // Ensure we have valid data
        if (!data) {
          logger.error("No data returned from edge function");
          return { channels: [], channelIds: [] };
        }
        
        // Process the response
        const response = data as ChannelsResponse;
        
        if (response.error) {
          logger.error("Error from edge function:", response.error);
          return { channels: [], channelIds: [] };
        }
        
        // Check if channels exists and is actually an array
        if (!response.channels) {
          logger.error("No channels property in response", response);
          return { channels: [], channelIds: [] };
        }
        
        if (!Array.isArray(response.channels)) {
          logger.error("Channels is not an array! Actual value:", response.channels);
          // Return empty arrays to prevent mapping errors
          return { channels: [], channelIds: [] };
        }
        
        // Ensure channels is an array and not null/undefined
        const channels = Array.isArray(response.channels) ? response.channels : [];
        
        logger.log(`Retrieved ${channels.length} channels from edge function:`, channels);
        
        // Add additional safety check before mapping
        if (!channels || !Array.isArray(channels)) {
          logger.error("Channels is still not an array after validation:", channels);
          return { channels: [], channelIds: [] };
        }
        
        // Extract channel IDs only if channels is valid
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
