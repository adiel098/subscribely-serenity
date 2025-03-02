
import { TelegramUser } from "../types/telegram-user.types";

/**
 * Extracts Telegram Web App data from window.Telegram
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
      
      // CRITICAL FIX: Ensure we're extracting the actual Telegram ID
      // The Telegram user ID comes as a number in the API response but we need to store as string
      // Make sure we're using the ID directly from the user object
      const telegramId = user.id?.toString() || "";
      console.log('🔑 Raw Telegram ID from WebApp:', user.id);
      console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
      
      // In recent Telegram WebApp versions, photo_url might be available directly
      // We explicitly check for its presence as a property
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
          
          // CRITICAL FIX: Ensure we're extracting the actual Telegram ID
          // Make sure we're using the ID directly from the parsed user object
          const telegramId = user.id?.toString() || "";
          console.log('🔑 Raw Telegram ID from parsed initData:', user.id);
          console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
          
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
 * Extracts user data from URL hash parameters
 */
export const getUserFromHashParams = (): TelegramUser | null => {
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
        
        // CRITICAL FIX: Extract the actual Telegram ID
        // Always ensure the ID is a string
        const telegramId = parsedUser.id?.toString() || "";
        console.log('🔑 Raw Telegram ID from hash:', parsedUser.id);
        console.log('🔑 Extracted Telegram ID (stringified):', telegramId);
        
        // CRITICAL FIX: Validate ID format
        if (telegramId && !/^\d+$/.test(telegramId)) {
          console.error('❌ INVALID TELEGRAM ID FORMAT FROM HASH:', telegramId);
          return null;
        }
        
        return {
          id: telegramId,
          first_name: parsedUser.first_name,
          last_name: parsedUser.last_name,
          username: parsedUser.username,
          photo_url: parsedUser.photo_url
        };
      }
    }
    return null;
  } catch (parseError) {
    console.error('❌ Error parsing initData from hash:', parseError);
    return null;
  }
};
