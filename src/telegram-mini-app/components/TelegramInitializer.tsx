
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
    // Force expand immediately
    if (window.Telegram?.WebApp) {
      console.log('📱 Forcing immediate WebApp expansion');
      try {
        window.Telegram.WebApp.expand();
      } catch (err) {
        console.error('📱 Error in immediate expand:', err);
      }
    }
    
    // Apply aggressive fullscreen strategy
    const applyFullScreen = () => {
      // Force fullscreen with multiple strategies
      if (window.Telegram?.WebApp?.expand) {
        console.log('📱 Forcing WebApp expansion (Promise-based)');
        window.Telegram.WebApp.expand().then(() => {
          console.log('📱 WebApp expansion successful');
        }).catch(err => {
          console.error('📱 WebApp expansion error:', err);
        });
      }
      
      // Alternative direct call if available
      if (window.Telegram?.WebApp?.expand) {
        try {
          console.log('📱 Forcing WebApp expansion (direct call)');
          window.Telegram.WebApp.expand();
        } catch (err) {
          console.error('📱 Error in direct expand:', err);
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
      
      // Apply viewport settings if available
      if (window.Telegram?.WebApp?.setViewport) {
        try {
          window.Telegram.WebApp.setViewport();
        } catch (e) {
          console.error('📱 Error setting viewport:', e);
        }
      }
      
      ensureFullScreen();
    };
    
    // Apply immediately
    applyFullScreen();
    
    // Initialize Telegram WebApp
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    console.log('📱 Telegram WebApp initialized:', initialized);
    
    // Debug available Telegram WebApp properties
    if (window.Telegram?.WebApp) {
      console.log('📱 Available WebApp methods:', Object.keys(window.Telegram.WebApp));
      console.log('📱 WebApp viewport height:', window.Telegram.WebApp.viewportHeight);
      console.log('📱 WebApp isExpanded:', window.Telegram.WebApp.isExpanded);
    }
    
    // Check if we're in development mode
    const devEnvironment = isDevelopment();
    setIsDevelopmentMode(devEnvironment);
    
    // Reapply fullscreen on timers
    const fullScreenTimeouts = [100, 300, 500, 1000, 2000].map(delay => 
      setTimeout(applyFullScreen, delay)
    );
    
    // Handle orientation and resize events
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📱 App became visible, reapplying fullscreen');
        applyFullScreen();
      }
    };
    
    const handleResize = () => {
      console.log('📏 Window resize detected, ensuring fullscreen');
      applyFullScreen();
    };
    
    const handleOrientationChange = () => {
      console.log('📱 Orientation change detected');
      // Multiple calls to catch viewport adjustments
      applyFullScreen();
      setTimeout(applyFullScreen, 100);
      setTimeout(applyFullScreen, 300);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Mark app as ready
    if (window.Telegram?.WebApp?.ready) {
      console.log('🚀 Marking WebApp as ready');
      window.Telegram.WebApp.ready();
    }
    
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

  // Only show development mode banner if debug is enabled in URL
  const showDebugInfo = isDevelopmentMode && window.location.search.includes('debug=true');
  
  if (showDebugInfo) {
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
