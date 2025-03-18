
import { Community } from "../hooks/useCommunities";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("channelTransformers");

export interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
  telegram_photo_url?: string;
}

/**
 * Transforms a Community object to a Channel object
 */
export const communityToChannel = (community: Community): Channel => {
  return {
    id: community.id,
    name: community.name,
    type: "channel", // Default type for all communities
    description: community.description || undefined,
    telegram_photo_url: community.telegram_photo_url || undefined
  };
};

/**
 * Transforms an array of Community objects to Channel objects
 */
export const communitiesToChannels = (communities: Community[]): Channel[] => {
  logger.log(`Converting ${communities.length} communities to channels`);
  return communities.map(communityToChannel);
};
