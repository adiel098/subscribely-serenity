
/**
 * Utility functions for working with Telegram user data
 */

export interface TelegramUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  email?: string;
}

/**
 * Extract Telegram Web App data from window.Telegram
 */
export const getWebAppData = (): TelegramUser | null => {
  try {
    console.log('🔍 Attempting to get WebApp data from window.Telegram...');
    console.log('📊 window.Telegram exists:', Boolean(window.Telegram));
    console.log('📊 window.Telegram.WebApp exists:', Boolean(window.Telegram?.WebApp));
    console.log('📊 initDataUnsafe exists:', Boolean(window.Telegram?.WebApp?.initDataUnsafe));
    console.log('📊 user exists:', Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user));
    
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      console.log('✅ Successfully retrieved WebApp data:', user);
      
      return {
        id: user.id?.toString() || "",
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
        // Note: photo_url is not available in WebApp data
      };
    }

    // If we have initData but no user, try parsing the initData
    if (window.Telegram?.WebApp?.initData && !window.Telegram?.WebApp?.initDataUnsafe?.user) {
      console.log('🔄 Trying to manually parse initData:', window.Telegram.WebApp.initData);
      try {
        // initData is a URLEncoded string with key=value pairs
        const data = new URLSearchParams(window.Telegram.WebApp.initData);
        const userStr = data.get('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          console.log('✅ Successfully parsed user data from initData:', user);
          
          return {
            id: user.id?.toString() || "",
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username
          };
        }
      } catch (parseError) {
        console.error('❌ Error parsing initData:', parseError);
      }
    }
    
    console.log('❌ WebApp data not available in window.Telegram');
    return null;
  } catch (error) {
    console.error("❌ Error extracting WebApp data:", error);
    return null;
  }
};

/**
 * Check URL hash for Telegram user data
 */
export const getUserFromUrlHash = (): TelegramUser | null => {
  try {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const initData = hashParams.get('tgWebAppData');
    
    if (initData) {
      console.log('🔍 Found initData in URL hash:', initData);
      try {
        const data = new URLSearchParams(initData);
        const userStr = data.get('user');
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          console.log('✅ Successfully parsed user data from hash:', parsedUser);
          return {
            id: parsedUser.id?.toString() || "",
            first_name: parsedUser.first_name,
            last_name: parsedUser.last_name,
            username: parsedUser.username
          };
        }
      } catch (parseError) {
        console.error('❌ Error parsing initData from hash:', parseError);
      }
    }
    return null;
  } catch (error) {
    console.error("❌ Error extracting user data from URL hash:", error);
    return null;
  }
};

// Detect if we're in development mode
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Mock data for development/testing
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
