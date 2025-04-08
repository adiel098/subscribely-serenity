
/**
 * Configuration constants for the application
 */

// Base URL for the mini app platform - dynamically determining the URL based on the environment
export const PLATFORM_BASE_URL = "https://trkiniaqliiwdkrvvuky.lovable.app";

// Full URL for the Telegram mini app - this is for the t.me link
export const TELEGRAM_MINI_APP_URL = `https://t.me/membifybot/app`;

// URL for direct access to the mini app web version - must be HTTPS
export const MINI_APP_WEB_URL = `${PLATFORM_BASE_URL}/telegram-mini-app`;

/**
 * Get the full mini app URL with query parameters
 * @param communityIdOrLink The community ID or custom link to include as a start parameter
 * @returns The complete mini app URL that's valid for Telegram buttons
 */
export const getMiniAppUrl = (communityIdOrLink: string): string => {
  // Make sure we have a valid parameter
  if (!communityIdOrLink) {
    console.error("Invalid community ID or link provided to getMiniAppUrl");
    return MINI_APP_WEB_URL;
  }
  
  // For Telegram web_app buttons, we must use a direct https URL that Telegram can validate
  // Using the web URL version instead of t.me links for button actions
  const url = new URL(MINI_APP_WEB_URL);
  url.searchParams.set('start', communityIdOrLink);
  
  return url.toString();
};
