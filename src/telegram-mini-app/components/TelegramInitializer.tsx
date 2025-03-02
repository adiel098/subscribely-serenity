
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
    // Apply full screen immediately with multiple attempts
    ensureFullScreen();
    
    // Initialize Telegram WebApp which will also try to expand to full screen
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    console.log('📱 Telegram WebApp initialized:', initialized);
    
    // Debug available Telegram WebApp properties
    if (window.Telegram?.WebApp) {
      console.log('📱 Available WebApp methods:', Object.keys(window.Telegram.WebApp));
    }
    
    // Check if we're in development mode
    const devEnvironment = isDevelopment();
    setIsDevelopmentMode(devEnvironment);
    
    if (devEnvironment && !window.Telegram?.WebApp) {
      console.log('🧪 Running in development mode without Telegram WebApp object');
    }
    
    // Additionally try to ensure full screen after component mounted with various delays
    const fullScreenTimeouts = [100, 300, 500, 1000, 2000, 3000].map(delay => 
      setTimeout(() => ensureFullScreen(), delay)
    );
    
    // Add resize handler to maintain full screen on orientation changes and resize events
    const handleResize = () => {
      console.log('📏 Window resize detected, re-ensuring full screen');
      ensureFullScreen();
      
      // Delayed additional call to catch any viewport adjustments
      setTimeout(ensureFullScreen, 300);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Force viewport update on orientation change
    const handleOrientationChange = () => {
      console.log('📱 Orientation change detected');
      
      // Multiple calls with increasing delays to ensure it works
      ensureFullScreen();
      [100, 300, 500, 1000].forEach(delay => {
        setTimeout(ensureFullScreen, delay);
      });
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Inform parent component about initialization state
    onInitialized(initialized, devEnvironment);
    
    // Apply CSS fixes for specific platforms
    const applyPlatformFixes = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS || isAndroid) {
        document.documentElement.classList.add('telegram-mobile');
        document.body.classList.add('telegram-mobile');
        
        // Add additional meta tag for better mobile rendering
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
          viewportMeta.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        } else {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
          document.head.appendChild(meta);
        }
      }
    };
    
    applyPlatformFixes();
    
    // Cleanup
    return () => {
      fullScreenTimeouts.forEach(clearTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
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
