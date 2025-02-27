
/**
 * Utility functions for initializing and working with the Telegram WebApp
 */

// Initialize Telegram WebApp
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

// Check if we're in development mode
export const isDevelopmentMode = (): boolean => {
  return process.env.NODE_ENV === 'development' || 
         window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1';
};

// Log Telegram WebApp information
export const logTelegramWebAppInfo = (startParam: string | null): void => {
  console.log('💫 TelegramMiniApp initialized with:');
  console.log('📌 startParam:', startParam);
  console.log('📌 URL:', window.location.href);
  
  // Log Telegram WebApp object if available
  if (window.Telegram?.WebApp) {
    console.log('📱 Telegram WebApp object is available:');
    console.log('📌 Full WebApp object:', window.Telegram.WebApp);
    console.log('📌 initData:', window.Telegram.WebApp.initData);
    console.log('📌 initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
    if (window.Telegram.WebApp.initDataUnsafe?.user) {
      console.log('👤 User from WebApp:', window.Telegram.WebApp.initDataUnsafe.user);
    }
  } else {
    console.log('❌ Telegram WebApp object is NOT available');
  }
};
