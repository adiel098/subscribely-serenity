import { TelegramUser } from '../types/telegramTypes';
import { isValidTelegramId, formatTelegramId, parseUserFromUrlHash } from './telegramUtils';

/**
 * Extract Telegram Web App data from window.Telegram
 */
export const getWebAppData = (directTelegramUserId?: string | null): TelegramUser | null => {
  try {
    console.log('🔍 Attempting to get WebApp data from window.Telegram...');
    console.log('📊 window.Telegram exists:', Boolean(window.Telegram));
    console.log('📊 window.Telegram.WebApp exists:', Boolean(window.Telegram?.WebApp));
    console.log('📊 initDataUnsafe exists:', Boolean(window.Telegram?.WebApp?.initDataUnsafe));
    console.log('📊 user exists:', Boolean(window.Telegram?.WebApp?.initDataUnsafe?.user));
    
    // Log the raw user object for debugging
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      console.log('📊 Raw user object:', JSON.stringify(window.Telegram.WebApp.initDataUnsafe.user));
      console.log('📊 Raw user id:', window.Telegram.WebApp.initDataUnsafe.user.id);
      console.log('📊 Raw user id type:', typeof window.Telegram.WebApp.initDataUnsafe.user.id);
    }
    
    console.log('📊 Direct Telegram User ID:', directTelegramUserId);
    
    // First, handle the case where we have a direct user ID
    if (directTelegramUserId) {
      // Validate and format the direct ID
      const formattedId = formatTelegramId(directTelegramUserId);
      if (!formattedId) {
        console.error('❌ Invalid direct Telegram ID format:', directTelegramUserId);
        return null;
      }
      
      console.log('✅ Using direct Telegram User ID:', formattedId);
      
      // If we also have WebApp data, we can enrich the user object
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        console.log('✅ Enriching direct ID with WebApp data:', user);
        
        return {
          id: formattedId,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url
        };
      }
      
      // Otherwise, return a minimal user object with just the ID
      return {
        id: formattedId
      };
    }
    
    // Direct access to Telegram WebApp user ID - highest priority
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      const rawId = window.Telegram.WebApp.initDataUnsafe.user.id;
      console.log('🔑 Raw ID from WebApp.initDataUnsafe.user.id:', rawId, 'type:', typeof rawId);
      
      // Convert to string regardless of type
      const userId = String(rawId).trim();
      console.log('🔑 Converted user ID:', userId);
      
      if (!/^\d+$/.test(userId)) {
        console.error('❌ Invalid Telegram ID format from WebApp:', userId);
        return null;
      }
      
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      return {
        id: userId,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url
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
          
          // Ensure we're getting a proper numeric ID and converting to string
          const userId = String(user.id).trim();
          if (!userId || !/^\d+$/.test(userId)) {
            console.error('❌ No valid user ID in parsed initData');
            return null;
          }
          
          return {
            id: userId,
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
    
    // Try to get user data from URL hash as a last resort
    const hashUser = parseUserFromUrlHash();
    if (hashUser) {
      const userId = String(hashUser.id).trim();
      if (!userId || !/^\d+$/.test(userId)) {
        console.error('❌ Invalid Telegram ID format from hash:', hashUser.id);
        return null;
      }
      
      return {
        id: userId,
        first_name: hashUser.first_name,
        last_name: hashUser.last_name,
        username: hashUser.username,
        photo_url: hashUser.photo_url
      };
    }
    
    console.log('❌ WebApp data not available in window.Telegram');
    return null;
  } catch (error) {
    console.error("❌ Error extracting WebApp data:", error);
    return null;
  }
};
