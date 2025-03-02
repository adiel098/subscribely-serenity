
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
      
      // Force expand to full screen with multiple attempts
      forceExpandToFullScreen();
      
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
 * Force the WebApp to expand with multiple attempts to ensure it works
 */
const forceExpandToFullScreen = () => {
  if (!window.Telegram?.WebApp?.expand) return;
  
  // Immediate expand
  console.log('📏 Forcing full screen expansion (first attempt)');
  window.Telegram.WebApp.expand();
  
  // Schedule multiple expand attempts with increasing delays
  [50, 100, 300, 500, 1000, 2000].forEach(delay => {
    setTimeout(() => {
      if (window.Telegram?.WebApp?.expand) {
        console.log(`📏 Re-expanding WebApp after ${delay}ms`);
        window.Telegram.WebApp.expand();
      }
    }, delay);
  });
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
  // Aggressively apply full screen mode
  forceExpandToFullScreen();
  
  // Additional platform-specific handling
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (isIOS) {
    // iOS specific handling
    document.documentElement.style.height = '100vh';
    document.body.style.height = '100vh';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
  
  if (isAndroid) {
    // Android specific handling
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
  }
  
  // Apply general full screen styles
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.position = 'fixed';
  document.documentElement.style.width = '100%';
  document.documentElement.style.maxHeight = '100vh';
};

