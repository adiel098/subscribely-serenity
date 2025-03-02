
/**
 * Utility functions for working with Telegram WebApp
 */

/**
 * Checks if the provided ID is a valid Telegram ID (numeric string)
 */
export const isValidTelegramId = (id: string | number | undefined | null): boolean => {
  if (id === undefined || id === null) return false;
  
  // Convert to string and trim any whitespace
  const stringId = String(id).trim();
  console.log('🔍 Validating Telegram ID:', stringId, 'type:', typeof id);
  
  // Check if it's a numeric string
  const isValid = /^\d+$/.test(stringId);
  console.log('✅ Telegram ID validation result:', isValid);
  
  return isValid;
};

/**
 * Get a properly formatted Telegram ID string from any input
 * Returns null if the ID is invalid
 */
export const formatTelegramId = (id: string | number | undefined | null): string | null => {
  if (id === undefined || id === null) {
    console.log('❌ Null or undefined Telegram ID provided');
    return null;
  }
  
  // Convert to string and trim any whitespace
  const stringId = String(id).trim();
  console.log('🔄 Formatting Telegram ID:', stringId, 'original type:', typeof id);
  
  if (isValidTelegramId(stringId)) {
    console.log('✅ Successfully formatted Telegram ID:', stringId);
    return stringId;
  } else {
    console.error('❌ Invalid Telegram ID format:', stringId);
    return null;
  }
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
      
      // Expand the WebApp to maximum available height
      // We call this first to ensure the app gets full screen immediately
      if (window.Telegram.WebApp.expand) {
        console.log('📏 Expanding WebApp to full screen');
        window.Telegram.WebApp.expand();
        
        // Force expand again after a short delay to ensure it takes effect
        setTimeout(() => {
          if (window.Telegram?.WebApp?.expand) {
            console.log('📏 Re-expanding WebApp to ensure full screen');
            window.Telegram.WebApp.expand();
          }
        }, 100);
      }
      
      // Set the correct viewport
      if (window.Telegram.WebApp.setViewport) {
        console.log('📏 Setting viewport');
        window.Telegram.WebApp.setViewport();
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

/**
 * Ensure the WebApp is expanded to full screen
 * This can be called at any time to force full screen mode
 */
export const ensureFullScreen = (): void => {
  if (window.Telegram?.WebApp?.expand) {
    console.log('📏 Ensuring full screen mode');
    window.Telegram.WebApp.expand();
  }
};
