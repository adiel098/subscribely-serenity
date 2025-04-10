
export interface TelegramChat {
  id: string;
  title: string; // Make title required to match the type in TelegramChatItem
  username?: string;
  type: string; // Make type required to match the expected type
  photo_url?: string;
  description?: string;
  invite_link?: string;
  member_count?: number;
  is_verified?: boolean;
}

// Utility function to convert string IDs to TelegramChat objects
export const stringToTelegramChat = (id: string): TelegramChat => {
  return { id, title: id, type: "channel" }; // Provide default title as id and type as "channel"
};

// Helper to convert string arrays to TelegramChat arrays
export const stringsToTelegramChats = (ids: string[]): TelegramChat[] => {
  return ids.map(id => ({ id, title: id, type: "channel" })); // Provide default title as id and type as "channel"
};
