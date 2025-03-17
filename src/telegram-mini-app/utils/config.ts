
/**
 * Configuration constants for the application
 */

// Base URL for the mini app platform
export const PLATFORM_BASE_URL = "https://preview--subscribely-serenity.lovable.app";

// Full URL for the Telegram mini app
export const TELEGRAM_MINI_APP_URL = `${PLATFORM_BASE_URL}/telegram-mini-app`;

/**
 * Get the full mini app URL with query parameters
 * @param communityIdOrLink The community ID or custom link to include as a start parameter
 * @returns The complete mini app URL
 */
export const getMiniAppUrl = (communityIdOrLink: string): string => {
  // Make sure we have a valid parameter
  if (!communityIdOrLink) {
    console.error("Invalid community ID or link provided to getMiniAppUrl");
    return TELEGRAM_MINI_APP_URL;
  }
  
  return `${TELEGRAM_MINI_APP_URL}?start=${communityIdOrLink}`;
};
