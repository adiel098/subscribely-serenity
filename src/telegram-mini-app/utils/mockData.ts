
/**
 * Utility functions for generating mock data for development
 */
import { TelegramUser } from '../types/telegramTypes';

/**
 * Returns a mock Telegram user for development/testing
 */
export const getMockUser = (): TelegramUser => {
  return {
    id: "123456789",
    first_name: "Test",
    last_name: "User",
    username: "testuser",
    photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
    email: "test@example.com"
  };
};
