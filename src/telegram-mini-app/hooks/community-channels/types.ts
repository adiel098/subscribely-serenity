
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
  type?: string;
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
