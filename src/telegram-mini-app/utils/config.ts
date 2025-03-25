
/**
 * Configuration constants for the application
 */

// Base URL for the mini app platform
export const PLATFORM_BASE_URL = "https://preview--subscribely-serenity.lovable.app";

// Full URL for the Telegram mini app
export const TELEGRAM_MINI_APP_URL = `https://t.me/membifybot/app`;

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
  
  // For the Telegram Mini App URL that's already a t.me link,
  // we need to append the start parameter differently
  if (TELEGRAM_MINI_APP_URL.includes('t.me/')) {
    // For t.me links, the parameter is added with a question mark
    return `${TELEGRAM_MINI_APP_URL}?startapp=${communityIdOrLink}`;
  }
  
  // For web URLs, use the normal format
  return `${TELEGRAM_MINI_APP_URL}?start=${communityIdOrLink}`;
};
