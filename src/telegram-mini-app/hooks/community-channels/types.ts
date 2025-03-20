
/**
 * Types for community channels functionality
 */

/**
 * Information about a Telegram channel
 */
export interface ChannelInfo {
  id: string;
  name: string;
  type: "channel" | "group" | "bot" | "supergroup";
  description?: string;
  telegram_invite_link?: string;
  telegram_photo_url?: string;
}

/**
 * Result returned by the useCommunityChannels hook
 */
export interface CommunityChannelsHookResult {
  channels: ChannelInfo[];
  isGroup: boolean;
  isLoading: boolean;
  error: string | null;
}
