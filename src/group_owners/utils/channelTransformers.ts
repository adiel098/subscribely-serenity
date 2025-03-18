
import { Community } from "../hooks/useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("channelTransformers");

export interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
  telegram_photo_url?: string;
  custom_link?: string;
}

/**
 * Transforms a Community object to a Channel object
 */
export const communityToChannel = (community: Community): Channel => {
  if (!community || typeof community !== 'object') {
    logger.error("Invalid community object:", community);
    return {
      id: "error-id",
      name: "Error: Invalid data",
      type: "unknown"
    };
  }
  
  return {
    id: community.id,
    name: community.name,
    type: "channel", // Default type for all communities
    description: community.description || undefined,
    telegram_photo_url: community.telegram_photo_url || undefined,
    custom_link: community.custom_link || undefined
  };
};

/**
 * Transforms an array of Community objects to Channel objects
 */
export const communitiesToChannels = (communities: Community[]): Channel[] => {
  if (!Array.isArray(communities)) {
    logger.error("communitiesToChannels received non-array input:", communities);
    return [];
  }
  
  logger.log(`Converting ${communities.length} communities to channels`);
  return communities
    .filter(community => community && typeof community === 'object')
    .map(communityToChannel);
};
