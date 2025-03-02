
/**
 * Utility functions for initializing the Telegram WebApp
 */

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
        try {
          window.Telegram.WebApp.setViewport();
        } catch (e) {
          console.error('📱 Error setting viewport:', e);
        }
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
export const forceExpandToFullScreen = () => {
  if (!window.Telegram?.WebApp?.expand) return;
  
  // Immediate expand (async Promise-based version)
  console.log('📏 Forcing full screen expansion (first attempt)');
  window.Telegram.WebApp.expand().then(() => {
    console.log('📱 Initial expansion successful');
  }).catch(err => {
    console.error('📱 Initial expansion error:', err);
  });
  
  // Schedule multiple expand attempts with increasing delays
  [50, 100, 300, 500, 1000].forEach(delay => {
    setTimeout(() => {
      if (window.Telegram?.WebApp?.expand) {
        console.log(`📏 Re-expanding WebApp after ${delay}ms`);
        window.Telegram.WebApp.expand().catch(err => {
          console.error(`📱 Expansion error after ${delay}ms:`, err);
        });
      }
    }, delay);
  });
};
