
import { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { initTelegramWebApp, isDevelopment, ensureFullScreen } from "@/telegram-mini-app/utils/telegramUtils";

interface TelegramInitializerProps {
  onInitialized?: (isInitialized: boolean, isDevelopmentMode: boolean) => void;
}

export const TelegramInitializer: React.FC<TelegramInitializerProps> = ({ 
  onInitialized = () => {}
}) => {
  const [telegramInitialized, setTelegramInitialized] = useState(false);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);

  useEffect(() => {
    // Initialize Telegram WebApp
    const initializeApp = () => {
      try {
        console.log('🚀 Initializing Telegram WebApp...');
        
        // Check if we're in development mode
        const devEnvironment = isDevelopment();
        setIsDevelopmentMode(devEnvironment);
        console.log('🧪 Development mode:', devEnvironment);
        
        // Apply fullscreen immediately
        applyFullScreen();
        
        // Initialize the WebApp
        const initialized = initTelegramWebApp();
        setTelegramInitialized(initialized);
        console.log('📱 Telegram WebApp initialized:', initialized);
        
        // Ensure WebApp is ready
        if (initialized && window.Telegram?.WebApp?.ready) {
          console.log('🚀 Marking WebApp as ready');
          window.Telegram.WebApp.ready();
        }
        
        // Schedule additional fullscreen attempts to ensure it works
        setTimeout(applyFullScreen, 100);
        setTimeout(applyFullScreen, 500);
        
        // Inform parent component about initialization state
        onInitialized(initialized, devEnvironment);
        
        return initialized;
      } catch (e) {
        console.error('💥 Error initializing Telegram WebApp:', e);
        setTelegramInitialized(false);
        onInitialized(false, isDevelopment());
        return false;
      }
    };
    
    // Apply aggressive fullscreen strategy
    const applyFullScreen = () => {
      try {
        console.log('📱 Applying fullscreen fixes');
        
        // Force fullscreen with multiple strategies
        if (window.Telegram?.WebApp?.expand) {
          console.log('📱 Expanding WebApp');
          window.Telegram.WebApp.expand();
        }
        
        // Call our utility function which applies various fixes
        ensureFullScreen();
        
        // Apply basic CSS fullscreen fixes
        document.documentElement.style.height = '100%';
        document.documentElement.style.width = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.width = '100%';
        document.body.style.overflow = 'auto';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        // Add classes to body for proper telegram mini app styling
        document.body.classList.add('telegram-mini-app');
        
        // Platform-specific fixes
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        if (isIOS) {
          // iOS specific viewport fixes
          document.body.classList.add('ios-scroll');
        }
        
        // Fix any containers to full width
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
          (container as HTMLElement).style.maxWidth = '100%';
          (container as HTMLElement).style.margin = '0 auto';
        });
      } catch (e) {
        console.error('💥 Error applying fullscreen:', e);
      }
    };
    
    // Initialize immediately
    initializeApp();
    
    // Handle orientation and resize events
    const handleResize = () => {
      console.log('📏 Window resize detected');
      applyFullScreen();
    };
    
    const handleOrientationChange = () => {
      console.log('📱 Orientation change detected');
      applyFullScreen();
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [onInitialized]);

  // Development mode banner
  if (isDevelopmentMode) {
    return (
      <Alert variant={window.Telegram?.WebApp ? "default" : "destructive"} className="mb-4 mx-0 mt-4">
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
