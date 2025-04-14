import { Community } from "@/group_owners/hooks/types/community.types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("channelTransformers");

// Define the Channel type for type safety
export interface Channel {
  id: string;
  name: string;
  description?: string;
  telegram_photo_url?: string;
  telegram_chat_id?: string;
  custom_link?: string;
}

/**
 * Transforms Community objects to Channel objects with robust error handling
 */
export const communitiesToChannels = (communities: Community[] | undefined): Channel[] => {
  logger.debug("communitiesToChannels input:", {
    communities,
    isArray: Array.isArray(communities),
    length: communities?.length || 0,
    type: typeof communities
  });
  
  // Guard against null/undefined or non-array input
  if (!communities) {
    logger.error("Null or undefined communities input to communitiesToChannels");
    return [];
  }
  
  // Ensure communities is actually an array
  if (!Array.isArray(communities)) {
    logger.error("Non-array communities input to communitiesToChannels:", communities);
    return [];
  }
  
  try {
    // Map communities to channels with proper type checking
    const channels = communities.map(community => {
      // Log each community being transformed
      logger.debug("Transforming community:", community);
      
      if (!community || typeof community !== 'object' || !community.id) {
        logger.error("Invalid community object:", community);
        return null;
      }
      
      return {
        id: community.id,
        name: community.name,
        description: community.description,
        telegram_photo_url: community.telegram_photo_url,
        telegram_chat_id: community.telegram_chat_id,
        custom_link: community.custom_link
      };
    }).filter(Boolean) as Channel[]; // Filter out any null values
    
    logger.debug("communitiesToChannels output:", {
      channels,
      length: channels.length
    });
    
    return channels;
  } catch (error) {
    logger.error("Error in communitiesToChannels:", error);
    return [];
  }
};
