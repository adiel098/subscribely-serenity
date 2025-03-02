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
    console.log('📊 viewport height:', window.innerHeight);
    console.log('📊 viewport width:', window.innerWidth);
    console.log('📊 User Agent:', navigator.userAgent);
    
    // Check if we have WebView attributes - using optional chaining to safely access properties
    if (window.Telegram?.WebApp) {
      // Only log these properties if they exist to avoid TypeScript errors
      if (typeof window.Telegram.WebApp.viewportHeight !== 'undefined') {
        console.log('📊 WebApp viewport height:', window.Telegram.WebApp.viewportHeight);
      }
      
      if (typeof window.Telegram.WebApp.viewportStableHeight !== 'undefined') {
        console.log('📊 WebApp viewport stable height:', window.Telegram.WebApp.viewportStableHeight);
      }
      
      if (typeof window.Telegram.WebApp.isExpanded !== 'undefined') {
        console.log('📊 WebApp isExpanded:', window.Telegram.WebApp.isExpanded);
      }
    }
    
    // Log the raw user object for debugging
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      console.log('📊 Raw user object:', JSON.stringify(window.Telegram.WebApp.initDataUnsafe.user));
      console.log('📊 Raw user id:', window.Telegram.WebApp.initDataUnsafe.user.id);
      console.log('📊 Raw user id type:', typeof window.Telegram.WebApp.initDataUnsafe.user.id);
    }
    
    console.log('📊 Direct Telegram User ID:', directTelegramUserId);
    
    // Extract Telegram ID directly from window.Telegram
    const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
    console.log('🔑 Directly extracted Telegram ID:', telegramUserId);
    
    if (telegramUserId) {
      // If we have a valid Telegram ID from the WebApp
      if (/^\d+$/.test(telegramUserId)) {
        console.log('✅ Valid Telegram ID from WebApp:', telegramUserId);
        
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        return {
          id: telegramUserId,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url
        };
      } else {
        console.error('❌ Invalid Telegram ID format from WebApp (not numeric):', telegramUserId);
      }
    }
    
    // First, handle the case where we have a direct user ID
    if (directTelegramUserId) {
      // Check if it's a numeric Telegram ID (not a UUID)
      if (/^\d+$/.test(directTelegramUserId)) {
        console.log('✅ Using valid direct Telegram User ID:', directTelegramUserId);
        
        // If we also have WebApp data, we can enrich the user object
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
          const user = window.Telegram.WebApp.initDataUnsafe.user;
          console.log('✅ Enriching direct ID with WebApp data:', user);
          
          return {
            id: directTelegramUserId,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url
          };
        }
        
        // Otherwise, return a minimal user object with just the ID
        return {
          id: directTelegramUserId
        };
      } else {
        console.error('❌ Invalid direct Telegram ID (not numeric):', directTelegramUserId);
      }
    }
    
    // Try to get user data from URL hash as a last resort
    const hashUser = parseUserFromUrlHash();
    if (hashUser && hashUser.id) {
      const userId = String(hashUser.id).trim();
      if (userId && /^\d+$/.test(userId)) {
        console.log('✅ Valid numeric Telegram ID from URL hash:', userId);
        
        return {
          id: userId,
          first_name: hashUser.first_name,
          last_name: hashUser.last_name,
          username: hashUser.username,
          photo_url: hashUser.photo_url
        };
      } else {
        console.error('❌ Invalid Telegram ID format from hash (not numeric):', hashUser.id);
      }
    }
    
    console.log('❌ Could not retrieve valid numeric Telegram ID from any source');
    return null;
  } catch (error) {
    console.error("❌ Error extracting WebApp data:", error);
    return null;
  }
};
