
/**
 * Represents a Telegram user with their essential information
 */
export interface TelegramUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
}
