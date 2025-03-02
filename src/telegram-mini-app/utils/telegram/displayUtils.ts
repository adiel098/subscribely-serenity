
/**
 * Utility functions for Telegram display and styling
 */

import { forceExpandToFullScreen } from './webAppInitializer';

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
    document.documentElement.style.width = '100vw';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.width = '100vw';
    document.body.style.position = 'fixed';
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
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
    
    // Fix any container width issues
    const containers = document.querySelectorAll('.container, [class*="max-w-"]');
    containers.forEach((container: Element) => {
      if (container instanceof HTMLElement) {
        container.style.maxWidth = '100%';
        container.style.width = '100%';
        container.style.paddingLeft = '0';
        container.style.paddingRight = '0';
        container.style.marginLeft = '0';
        container.style.marginRight = '0';
      }
    });
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
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Fix any container width issues
    const containers = document.querySelectorAll('.container, [class*="max-w-"]');
    containers.forEach((container: Element) => {
      if (container instanceof HTMLElement) {
        container.style.maxWidth = '100%';
        container.style.width = '100%';
        container.style.paddingLeft = '0';
        container.style.paddingRight = '0';
        container.style.marginLeft = '0';
        container.style.marginRight = '0';
      }
    });
  }
  
  // Apply general full screen styles to root app container
  const appContainer = document.getElementById('root');
  if (appContainer) {
    appContainer.style.height = '100%';
    appContainer.style.width = '100%';
    appContainer.style.overflow = 'auto';
    appContainer.style.position = 'relative';
    appContainer.style.maxWidth = '100%';
    appContainer.style.paddingLeft = '0';
    appContainer.style.paddingRight = '0';
    appContainer.style.marginLeft = '0';
    appContainer.style.marginRight = '0';
  }
  
  // Apply general full screen styles
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.width = '100%';
  document.documentElement.style.height = '100%';
  document.body.style.overflow = 'hidden';
  document.body.style.width = '100%';
  document.body.style.height = '100%';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  
  // Additional fixes for specific components that might have whitespace
  setTimeout(() => {
    document.querySelectorAll('[class*="w-full"], [class*="max-w-"]').forEach((element: Element) => {
      if (element instanceof HTMLElement) {
        element.style.maxWidth = '100%';
        element.style.width = '100%';
        element.style.paddingLeft = '0';
        element.style.paddingRight = '0';
        element.style.marginLeft = '0';
        element.style.marginRight = '0';
      }
    });
  }, 100);
};
