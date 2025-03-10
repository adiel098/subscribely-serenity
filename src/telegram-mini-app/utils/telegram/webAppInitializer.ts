
/**
 * Utility functions for initializing the Telegram WebApp
 */

/**
 * Initialize the Telegram WebApp
 */
export const initTelegramWebApp = (): boolean => {
  try {
    if (window.Telegram?.WebApp) {
      console.log('📱 WebApp is available, version:', window.Telegram.WebApp.version);
      
      // Log available WebApp methods
      console.log('📱 Available WebApp methods:', Object.keys(window.Telegram.WebApp));
      
      // Force expand to full screen with multiple attempts
      forceExpandToFullScreen();
      
      // Check if we have initData
      if (window.Telegram.WebApp.initData) {
        console.log('📱 WebApp has initData:', window.Telegram.WebApp.initData.substring(0, 50) + '...');
      } else {
        console.warn('⚠️ WebApp initData is empty');
      }
      
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
      console.warn('❌ WebApp object is not available');
      
      // When running in browser development mode
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🧪 Running in development mode, creating mock WebApp object');
        
        // Create mock WebApp object for development
        window.Telegram = {
          WebApp: {
            ready: () => console.log('Mock WebApp.ready() called'),
            expand: () => console.log('Mock WebApp.expand() called'),
            isExpanded: true,
            viewportHeight: window.innerHeight,
            viewportStableHeight: window.innerHeight,
            version: '6.0',
            platform: 'web',
            initData: '',
            initDataUnsafe: {
              user: {
                id: 123456789,
                first_name: 'Test',
                last_name: 'User',
                username: 'testuser',
                language_code: 'en'
              }
            },
            openTelegramLink: (url) => {
              console.log('Mock WebApp.openTelegramLink() called with:', url);
              window.open(url, '_blank');
            }
          }
        };
        
        return true;
      }
      
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
  try {
    if (!window.Telegram?.WebApp?.expand) {
      console.warn('⚠️ WebApp.expand is not available');
      return;
    }
    
    // Check if already expanded
    if (window.Telegram.WebApp.isExpanded) {
      console.log('📱 WebApp is already expanded');
    } else {
      // Immediate expand
      console.log('📏 Forcing full screen expansion (first attempt)');
      window.Telegram.WebApp.expand();
      
      // Schedule multiple expand attempts with increasing delays
      [50, 100, 300, 500, 1000].forEach(delay => {
        setTimeout(() => {
          if (window.Telegram?.WebApp?.expand && !window.Telegram.WebApp.isExpanded) {
            console.log(`📏 Re-expanding WebApp after ${delay}ms`);
            window.Telegram.WebApp.expand();
          }
        }, delay);
      });
    }
  } catch (error) {
    console.error('❌ Error expanding WebApp:', error);
  }
};
