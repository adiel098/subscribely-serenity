
/**
 * Utility functions for Telegram display and styling
 */

import { forceExpandToFullScreen } from './webAppInitializer';

/**
 * Ensure the WebApp is expanded to full screen
 * This can be called at any time to force full screen mode
 */
export const ensureFullScreen = (): void => {
  try {
    // Aggressively apply full screen mode
    forceExpandToFullScreen();
    
    // Log current dimensions for debugging
    console.log('📏 Window dimensions:', {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight
    });
    
    // Additional platform-specific handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      // iOS specific handling
      document.documentElement.style.height = '100vh';
      document.documentElement.style.width = '100vw';
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.width = '100vw';
      document.body.style.position = 'fixed';
      document.body.style.overflow = 'auto';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      
      // Add class for iOS scrolling
      document.body.classList.add('ios-scroll');
      document.body.classList.add('no-zoom');
      
      // Remove any padding or margin on container elements
      const containers = document.querySelectorAll('.container');
      containers.forEach(container => {
        (container as HTMLElement).style.maxWidth = '100%';
        (container as HTMLElement).style.margin = '0 auto';
        (container as HTMLElement).style.padding = '0 2px';
      });
      
      // iOS viewport meta
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height';
        document.head.appendChild(meta);
      }
      
      // Prevent zoom for iOS
      preventIOSZoom();
    }
    
    if (isAndroid) {
      // Android specific handling
      document.documentElement.style.height = '100%';
      document.documentElement.style.width = '100%';
      document.documentElement.style.position = 'absolute';
      document.documentElement.style.top = '0';
      document.documentElement.style.left = '0';
      document.documentElement.style.right = '0';
      document.documentElement.style.bottom = '0';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.height = '100%';
      document.body.style.width = '100%';
      document.body.style.overflow = 'auto';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.classList.add('no-zoom');
      
      // Add appropriate padding to container elements
      const containers = document.querySelectorAll('.container');
      containers.forEach(container => {
        (container as HTMLElement).style.maxWidth = '100%';
        (container as HTMLElement).style.margin = '0 auto';
        (container as HTMLElement).style.padding = '0 2px';
      });
    }
    
    // Apply general full screen styles to root app container
    const appContainer = document.getElementById('root');
    if (appContainer) {
      appContainer.style.height = '100%';
      appContainer.style.width = '100%';
      appContainer.style.overflow = 'auto';
      appContainer.style.position = 'relative';
      appContainer.style.margin = '0 auto';
      appContainer.style.maxWidth = '100%';
      appContainer.classList.add('no-zoom');
    }
    
    // Add the telegram-mini-app class to body for specific styling
    document.body.classList.add('telegram-mini-app');
    
    // Apply general full screen styles
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.width = '100%';
    document.documentElement.style.height = '100%';
    document.body.style.overflow = 'auto';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Apply small padding to telegram-mini-app-container
    const miniAppContainers = document.querySelectorAll('.telegram-mini-app-container');
    miniAppContainers.forEach(container => {
      (container as HTMLElement).style.paddingLeft = '2px';
      (container as HTMLElement).style.paddingRight = '2px';
    });
    
    // Global zoom prevention
    preventGlobalZoom();
    
    console.log('✅ Full screen applied successfully');
  } catch (error) {
    console.error('❌ Error applying full screen:', error);
  }
};

/**
 * Prevent zooming specifically for iOS devices
 */
const preventIOSZoom = (): void => {
  try {
    // Prevent double tap zoom on iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
    
    console.log('🍏 iOS zoom prevention applied');
  } catch (error) {
    console.error('❌ Error applying iOS zoom prevention:', error);
  }
};

/**
 * Apply global zoom prevention techniques
 */
const preventGlobalZoom = (): void => {
  try {
    // Prevent pinch zoom
    document.addEventListener('touchmove', function(event) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }, { passive: false });
    
    // Prevent mousewheel zoom with ctrl key
    document.addEventListener('wheel', function(event) {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    }, { passive: false });
    
    // Add css class for zoom prevention
    document.documentElement.classList.add('no-zoom');
    
    console.log('🔒 Global zoom prevention applied');
  } catch (error) {
    console.error('❌ Error applying global zoom prevention:', error);
  }
};
