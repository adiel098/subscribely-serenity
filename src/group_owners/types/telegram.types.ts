
export interface TelegramChat {
  id: string;
  title?: string;
  username?: string;
  type?: string;
  photo_url?: string;
  description?: string;
  invite_link?: string;
}

// Utility function to convert string IDs to TelegramChat objects
export const stringToTelegramChat = (id: string): TelegramChat => {
  return { id };
};

// Helper to convert string arrays to TelegramChat arrays
export const stringsToTelegramChats = (ids: string[]): TelegramChat[] => {
  return ids.map(id => ({ id }));
};

