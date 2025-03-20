
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("channelsService");

/**
 * Fetch channels data for a community from the edge function
 * 
 * @param communityId The ID of the community to fetch channels for
 * @returns The response from the edge function
 */
export const fetchCommunityChannels = async (communityId: string) => {
  try {
    logger.log(`Fetching channels for community ${communityId}`);
    
    const response = await supabase.functions.invoke("get-community-channels", {
      body: { communityId }
    });
    
    if (response.error) {
      logger.error(`Error fetching channels: ${response.error.message}`);
      throw new Error(response.error.message);
    }
    
    logger.log(`Got channels data:`, response.data);
    return response.data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    logger.error(`Error in fetchCommunityChannels: ${errorMessage}`);
    throw err;
  }
};

/**
 * Process and log channel information
 * 
 * @param channels Array of channels to log information for
 */
export const logChannelsInfo = (channels: any[]) => {
  if (!channels || !Array.isArray(channels)) {
    logger.warn('No channels array or invalid format');
    return;
  }
  
  channels.forEach((channel, index) => {
    logger.log(`Channel ${index + 1}: ${channel.name}, Invite Link: ${channel.telegram_invite_link || 'None'}`);
  });
};
