
import { supabase } from "@/integrations/supabase/client";
import { ChannelInfo } from "./types";
import { createLogger } from "../../utils/debugUtils";

const logger = createLogger("channelsService");

/**
 * Fetch channels for a community
 * 
 * @param communityId ID of the community to fetch channels for
 * @returns Object containing isGroup flag and channels array
 */
export const fetchCommunityChannels = async (communityId: string) => {
  try {
    logger.log(`Fetching community channels for: ${communityId}`);
    
    const { data, error } = await supabase.functions.invoke("get-community-channels", {
      body: { communityId }
    });
    
    if (error) {
      logger.error(`Error fetching channels: ${error.message}`, error);
      throw new Error(`Failed to fetch channels: ${error.message}`);
    }
    
    logger.log(`Raw response from get-community-channels:`, data);
    
    if (!data) {
      logger.warn("No data returned from get-community-channels");
      return { isGroup: false, channels: [] };
    }
    
    // Ensure channels data is properly formatted
    const channels = Array.isArray(data.channels) ? data.channels : [];
    
    // Log results
    if (data.isGroup) {
      logger.success(`Successfully fetched ${channels.length} channels for group ${communityId}`);
      
      // Log channels data
      logChannelsInfo(channels);
      
      return {
        isGroup: true,
        channels: channels
      };
    } else {
      logger.log(`Community ${communityId} is not a group`);
      return { isGroup: false, channels: [] };
    }
  } catch (error) {
    logger.error(`Error in fetchCommunityChannels: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

/**
 * Log channel information for debugging
 */
export const logChannelsInfo = (channels: ChannelInfo[]) => {
  if (!channels || channels.length === 0) {
    logger.warn('No channels array or empty channels');
    return;
  }

  logger.log(`Found ${channels.length} channels`);
  channels.forEach((channel, index) => {
    logger.log(
      `Channel ${index + 1}: ${channel.name} - Has Link: ${
        Boolean(channel.telegram_invite_link) ? 'Yes' : 'No'
      } - ID: ${channel.id}`
    );
  });
};
