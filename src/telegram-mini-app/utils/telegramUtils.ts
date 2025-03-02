
/**
 * Utility functions for working with Telegram WebApp
 */

/**
 * Checks if the provided ID is a valid Telegram ID (numeric string)
 */
export const isValidTelegramId = (id: string | number | undefined | null): boolean => {
  if (!id) return false;
  const stringId = id.toString();
  return /^\d+$/.test(stringId) && stringId.length > 5; // Telegram IDs are typically long numeric strings
};

/**
 * Get a properly formatted Telegram ID string from any input
 * Returns null if the ID is invalid
 */
export const formatTelegramId = (id: string | number | undefined | null): string | null => {
  if (!id) return null;
  const stringId = id.toString();
  return isValidTelegramId(stringId) ? stringId : null;
};

/**
 * Detect if we're in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

/**
 * Initialize the Telegram WebApp
 */
export const initTelegramWebApp = (): boolean => {
  try {
    if (window.Telegram?.WebApp) {
      console.log('📱 WebApp is already initialized');
      
      // Set the correct viewport
      if (window.Telegram.WebApp.setViewport) {
        console.log('📏 Setting viewport');
        window.Telegram.WebApp.setViewport();
      }
      
      // Expand the WebApp to maximum available height
      if (window.Telegram.WebApp.expand) {
        console.log('📏 Expanding WebApp');
        window.Telegram.WebApp.expand();
      }
      
      // Mark as ready
      if (window.Telegram.WebApp.ready) {
        console.log('🚀 Marking WebApp as ready');
        window.Telegram.WebApp.ready();
      }
      
      return true;
    } else {
      console.log('❌ WebApp object is not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing Telegram WebApp:', error);
    return false;
  }
};

/**
 * Try to parse the Telegram user data from the URL hash
 */
export const parseUserFromUrlHash = (): { [key: string]: any } | null => {
  try {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const initData = hashParams.get('tgWebAppData');
    
    if (initData) {
      console.log('🔍 Found initData in URL hash:', initData);
      const data = new URLSearchParams(initData);
      const userStr = data.get('user');
      
      if (userStr) {
        const parsedUser = JSON.parse(userStr);
        console.log('✅ Successfully parsed user data from hash:', parsedUser);
        return parsedUser;
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error parsing user data from URL hash:', error);
    return null;
  }
};
