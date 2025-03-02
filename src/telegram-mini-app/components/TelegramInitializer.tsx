
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { initTelegramWebApp, isDevelopment, ensureFullScreen } from "@/telegram-mini-app/utils/telegramUtils";

interface TelegramInitializerProps {
  onInitialized: (isInitialized: boolean, isDevelopmentMode: boolean) => void;
}

export const TelegramInitializer: React.FC<TelegramInitializerProps> = ({ onInitialized }) => {
  const [telegramInitialized, setTelegramInitialized] = useState(false);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  useEffect(() => {
    // Apply aggressive fullscreen strategy
    const applyFullScreen = () => {
      try {
        // Use short alias for Telegram WebApp if available - using tg.expand() as requested
        const tg = window.Telegram?.WebApp;
        if (tg) {
          console.log('📱 Using tg.expand() to ensure full width display');
          if (tg.expand) {
            tg.expand();
          }
        }
        
        // Apply CSS fullscreen fixes
        document.documentElement.style.height = '100%';
        document.documentElement.style.width = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        // Platform-specific fixes
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
          // iOS specific viewport fixes
          document.body.style.position = 'fixed';
          document.body.style.width = '100vw';
          document.body.style.height = '100vh';
          
          // Add iOS viewport meta
          const viewportMeta = document.querySelector('meta[name="viewport"]');
          if (viewportMeta) {
            viewportMeta.setAttribute('content', 
              'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height');
          }
        }
        
        if (isAndroid) {
          // Android specific fixes
          document.documentElement.style.position = 'absolute';
          document.documentElement.style.top = '0';
          document.documentElement.style.left = '0';
          document.documentElement.style.right = '0';
          document.documentElement.style.bottom = '0';
        }
        
        ensureFullScreen();
      } catch (e) {
        console.error('📱 Error applying fullscreen:', e);
      }
    };
    
    // Apply immediately and multiple times to ensure it works
    applyFullScreen();
    
    // Initialize Telegram WebApp
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    console.log('📱 Telegram WebApp initialized:', initialized);
    
    // Debug available Telegram WebApp properties
    if (window.Telegram?.WebApp) {
      console.log('📱 Available WebApp methods:', Object.keys(window.Telegram.WebApp));
      
      // Mark app as ready
      if (window.Telegram.WebApp.ready) {
        console.log('🚀 Marking WebApp as ready');
        window.Telegram.WebApp.ready();
      }
    }
    
    // Check if we're in development mode
    const devEnvironment = isDevelopment();
    setIsDevelopmentMode(devEnvironment);
    
    // Reapply fullscreen on timers with tg.expand()
    const fullScreenTimeouts = [100, 300, 500, 1000, 2000].map(delay => 
      setTimeout(() => {
        try {
          if (window.Telegram?.WebApp?.expand) {
            window.Telegram.WebApp.expand();
          }
          applyFullScreen();
        } catch (e) {
          console.error(`📱 Error in delayed fullscreen (${delay}ms):`, e);
        }
      }, delay)
    );
    
    // Handle orientation and resize events
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 App became visible, reapplying fullscreen');
        if (window.Telegram?.WebApp?.expand) {
          window.Telegram.WebApp.expand();
        }
        applyFullScreen();
      }
    };
    
    const handleResize = () => {
      console.log('📏 Window resize detected, ensuring fullscreen');
      if (window.Telegram?.WebApp?.expand) {
        window.Telegram.WebApp.expand();
      }
      applyFullScreen();
    };
    
    const handleOrientationChange = () => {
      console.log('📱 Orientation change detected');
      // Multiple calls to catch viewport adjustments
      if (window.Telegram?.WebApp?.expand) {
        window.Telegram.WebApp.expand();
      }
      applyFullScreen();
      setTimeout(() => {
        if (window.Telegram?.WebApp?.expand) {
          window.Telegram.WebApp.expand();
        }
        applyFullScreen();
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Inform parent component about initialization state
    onInitialized(initialized, devEnvironment);
    
    // Cleanup
    return () => {
      fullScreenTimeouts.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onInitialized]);

  // Development mode banner
  if (isDevelopmentMode) {
    return (
      <Alert variant={window.Telegram?.WebApp ? "default" : "destructive"} className="mb-4 mx-4 mt-4">
        {window.Telegram?.WebApp ? (
          <Info className="h-4 w-4" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        <AlertTitle>Development Mode</AlertTitle>
        <AlertDescription>
          {window.Telegram?.WebApp 
            ? "Running in development mode with Telegram WebApp available."
            : "Running outside of Telegram environment. Using mock data for development."}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
