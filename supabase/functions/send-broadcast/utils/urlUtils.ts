import { createLogger } from '../../_shared/logger.ts';

const logger = createLogger('url-utils');

// Get the Mini App URL from environment variables, with fallback to preview URL
const MINI_APP_URL = Deno.env.get('MINI_APP_URL') || 'https://preview--subscribely-serenity.lovable.app/telegram-mini-app';

/**
 * Generate a web app URL for Telegram Mini App
 */
export function generateMiniAppUrl(communityId: string): string {
  return `${MINI_APP_URL}?start=${communityId}`;
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
          text: buttonText || 'Join Community ',
          web_app: { url: webAppUrl }
        }
      ]
    ]
  };
}
