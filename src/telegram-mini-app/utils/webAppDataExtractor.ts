import { TelegramUser } from "../types/telegramTypes";
import { createLogger } from "./debugUtils";

const logger = createLogger('webAppDataExtractor');

export const getWebAppData = (userId?: string): TelegramUser | null => {
  try {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      logger.log('Telegram WebApp is available');
      
      // Get WebApp data from Telegram
      const webAppData = window.Telegram.WebApp;
      const userString = webAppData.initDataUnsafe?.user;

      if (!userString) {
        logger.warn('No user data in WebApp');
        return null;
      }

      const user = typeof userString === 'string' 
        ? JSON.parse(userString) 
        : userString;

      if (user) {
        const telegramUser: TelegramUser = {
          id: userId || user.id?.toString(),
          username: user.username || null,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          photo_url: user.photo_url || null
        };

        logger.log('Extracted WebApp user data:', telegramUser);
        return telegramUser;
      }
    } else {
      logger.warn('Telegram WebApp not available');
    }
  } catch (error) {
    logger.error('Error extracting WebApp data:', error);
  }
  return null;
};

export const getProjectIdFromStartParam = (startParam: string | null): string | null => {
  if (!startParam) return null;
  
  // If startParam starts with 'project_', extract the project ID
  if (startParam.startsWith('project_')) {
    return startParam.replace('project_', '');
  }
  
  // Otherwise, it's a normal community ID/link
  return null;
};
