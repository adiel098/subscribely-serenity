
import { TelegramUser } from "@/telegram-mini-app/hooks/types/telegramTypes";

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
      
      // CRITICAL: Ensure ID is present and correctly formatted
      if (!user.id) {
        console.error('❌ Missing Telegram ID in WebApp data');
        return null;
      }
      
      // Convert to string and validate format
      const telegramId = user.id.toString().trim();
      
      console.log('🔑 Raw Telegram ID from WebApp:', user.id);
      console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
      
      // Validate that ID is numeric (all Telegram IDs should be)
      if (!/^\d+$/.test(telegramId)) {
        console.error('❌ Invalid Telegram ID format:', telegramId);
        console.error('❌ Telegram IDs should be numeric. Returning null.');
        return null;
      }
      
      // In recent Telegram WebApp versions, photo_url might be available directly
      const photoUrl = user.photo_url || undefined;
      console.log('📸 Photo URL from WebApp data:', photoUrl);
      
      return {
        id: telegramId,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: photoUrl
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
          
          // Validate user ID
          if (!user.id) {
            console.error('❌ Missing Telegram ID in parsed initData');
            return null;
          }
          
          const telegramId = user.id.toString().trim();
          console.log('🔑 Raw Telegram ID from parsed initData:', user.id);
          console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
          
          // Validate that ID is numeric
          if (!/^\d+$/.test(telegramId)) {
            console.error('❌ Invalid Telegram ID format in parsed initData:', telegramId);
            return null;
          }
          
          return {
            id: telegramId,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url
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
 * Extract user data from URL hash parameters (sometimes Telegram puts data here)
 */
export const getUserFromUrlHash = async (communityId: string): Promise<TelegramUser | null> => {
  try {
    // Check if there's initData in the URL hash (Telegram mini apps sometimes put it there)
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
          
          // Validate user ID
          if (!parsedUser.id) {
            console.error('❌ Missing Telegram ID in hash data');
            return null;
          }
          
          const telegramId = parsedUser.id.toString().trim();
          console.log('🔑 Raw Telegram ID from hash:', parsedUser.id);
          console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
          
          // Validate ID format - must be numeric
          if (!/^\d+$/.test(telegramId)) {
            console.error('❌ INVALID TELEGRAM ID FORMAT FROM HASH:', telegramId);
            return null;
          }
          
          const userData: TelegramUser = {
            id: telegramId,
            first_name: parsedUser.first_name,
            last_name: parsedUser.last_name,
            username: parsedUser.username,
            photo_url: parsedUser.photo_url
          };
          
          return userData;
        }
      } catch (parseError) {
        console.error('❌ Error parsing initData from hash:', parseError);
      }
    }
    return null;
  } catch (error) {
    console.error('❌ Error extracting user from URL hash:', error);
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
