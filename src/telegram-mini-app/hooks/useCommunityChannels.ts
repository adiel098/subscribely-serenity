
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "../utils/debugUtils";

const logger = createLogger("useCommunityChannels");

interface ChannelInfo {
  id: string;
  name: string;
  type: "channel" | "group" | "bot" | "supergroup";
  description?: string;
}

interface CommunityChannelsHookResult {
  channels: ChannelInfo[];
  isGroup: boolean;
  isLoading: boolean;
  error: string | null;
}

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
        
        logger.log(`Fetching channels for community ${communityId}`);
        
        // Call the dedicated edge function to get community channels
        const { data, error } = await supabase.functions.invoke("get-community-channels", {
          body: { communityId }
        });
        
        if (error) {
          logger.error(`Error fetching channels: ${error.message}`);
          setError(error.message);
          return;
        }
        
        if (data) {
          logger.log(`Got channels data:`, data);
          
          if (data.isGroup && Array.isArray(data.channels)) {
            setIsGroup(true);
            setChannels(data.channels);
            logger.log(`Set ${data.channels.length} channels for group ${communityId}`);
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
