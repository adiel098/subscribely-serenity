
import { ChannelLink } from "../types/inviteLink.types";
import { createLogger } from "../../../utils/debugUtils";

const logger = createLogger("inviteLinkUtils");

/**
 * Attempts to parse an invite link as JSON
 * @returns Parsed data or null if not valid JSON
 */
export const parseInviteLinkJson = (inviteLink: string) => {
  try {
    const parsedData = JSON.parse(inviteLink);
    logger.log('Successfully parsed invite link as JSON:', parsedData);
    
    if (parsedData.isGroup) {
      return parsedData;
    }
    return null;
  } catch (err) {
    // Not a JSON string
    logger.log('Invite link is not in JSON format');
    return null;
  }
};

/**
 * Extracts the start parameter from a Telegram bot link
 */
export const extractStartParam = (link: string): string | null => {
  const startParamMatch = link.match(/start=([^&]+)/);
  if (!startParamMatch) return null;
  return startParamMatch[1];
};

/**
 * Logs channel information for debugging
 */
export const logChannelsInfo = (channels: ChannelLink[]) => {
  if (!channels || channels.length === 0) {
    logger.warn('No channels array or empty channels');
    return;
  }

  logger.log(`Found ${channels.length} channels`);
  channels.forEach((channel, index) => {
    logger.log(
      `Channel ${index + 1}: ${channel.name} - Link: ${
        (channel.inviteLink || '').substring(0, 30)
      }... - isMiniApp: ${channel.isMiniApp || false}`
    );
  });
};
