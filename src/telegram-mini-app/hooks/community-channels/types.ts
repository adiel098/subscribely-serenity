
/**
 * Channel information interface
 */
export interface ChannelInfo {
  id: string;
  name: string;
  description?: string | null;
  telegram_chat_id?: string | null;
  telegram_invite_link?: string | null;
  telegram_photo_url?: string | null;
  type?: "bot" | "channel" | "group" | "supergroup" | string; // Updated to be more flexible with string union
  is_group?: boolean;
}

/**
 * Hook result interface for useCommunityChannels
 */
export interface CommunityChannelsHookResult {
  channels: ChannelInfo[];
  isGroup: boolean;
  isLoading: boolean;
  error: string | null;
}
