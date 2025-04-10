
export interface TelegramChat {
  id: string;
  title: string;
  username?: string;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  members_count?: number;
  photo_url?: string;
}

// Helper function to convert string to TelegramChat
export const stringToTelegramChat = (id: string): TelegramChat => ({
  id,
  title: id,
  type: 'group'
});
