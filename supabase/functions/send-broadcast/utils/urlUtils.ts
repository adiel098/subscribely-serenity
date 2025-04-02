
import { createLogger } from '../../_shared/logger.ts';

const logger = createLogger('url-utils');

// Define URLs as constants
export const TELEGRAM_MINI_APP_URL = 'https://app.membify.dev';
export const PREVIEW_APP_URL = 'https://preview--subscribely-serenity.lovable.app/telegram-mini-app';

/**
 * Generate a web app URL for Telegram Mini App
 */
export function generateMiniAppUrl(communityId: string): string {
  // Use the official URL in production, fallback to preview for development
  const baseUrl = TELEGRAM_MINI_APP_URL || PREVIEW_APP_URL;
  return `${baseUrl}?start=${communityId}`;
}

/**
 * Create an inline keyboard for the join button
 */
export function createJoinButton(communityId: string, buttonText: string): any {
  const webAppUrl = generateMiniAppUrl(communityId);

  logger.log(`Created join button with URL: ${webAppUrl}`);
  
  return {
    inline_keyboard: [
      [
        {
          text: buttonText || 'Join Community 🚀',
          web_app: { url: webAppUrl }
        }
      ]
    ]
  };
}
