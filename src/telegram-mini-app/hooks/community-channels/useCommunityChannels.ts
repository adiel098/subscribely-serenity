
import { useState, useEffect } from "react";
import { createLogger } from "../../utils/debugUtils";
import { fetchCommunityChannels, logChannelsInfo } from "./channelsService";
import { ChannelInfo, CommunityChannelsHookResult } from "./types";

const logger = createLogger("useCommunityChannels");

/**
 * Hook to fetch and manage community channels data
 * 
 * @param communityId ID of the community to fetch channels for
 * @returns Object containing channels data, loading state, and error information
 */
export const useCommunityChannels = (communityId: string | null): CommunityChannelsHookResult => {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId) {
      return;
    }

    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchCommunityChannels(communityId);
        
        if (data) {
          if (data.isGroup && Array.isArray(data.channels)) {
            setIsGroup(true);
            setChannels(data.channels);
            logger.log(`Set ${data.channels.length} channels for group ${communityId}`);
            
            // Log the channels and their invite links for debugging
            logChannelsInfo(data.channels);
          } else {
            setIsGroup(false);
            setChannels([]);
            logger.log(`Community ${communityId} is not a group or has no channels`);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        logger.error(`Error in useCommunityChannels: ${errorMessage}`);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [communityId]);

  return {
    channels,
    isGroup,
    isLoading,
    error
  };
};

// Export types for use in other components
export type { ChannelInfo, CommunityChannelsHookResult };
