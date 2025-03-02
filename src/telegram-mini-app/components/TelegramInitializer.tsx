
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
    // Initialize Telegram WebApp which will try to expand to full screen
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    console.log('📱 Telegram WebApp initialized:', initialized);
    
    // Check if we're in development mode
    const devEnvironment = isDevelopment();
    setIsDevelopmentMode(devEnvironment);
    
    if (devEnvironment && !window.Telegram?.WebApp) {
      console.log('🧪 Running in development mode without Telegram WebApp object');
    }
    
    // Ensure full screen on mount
    ensureFullScreen();
    
    // Additionally ensure full screen after a slight delay
    const fullScreenTimeout = setTimeout(() => {
      ensureFullScreen();
    }, 500);
    
    // Also call ensureFullScreen on window resize to maintain full screen
    const handleResize = () => {
      ensureFullScreen();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Inform parent component about initialization state
    onInitialized(initialized, devEnvironment);
    
    // Cleanup
    return () => {
      clearTimeout(fullScreenTimeout);
      window.removeEventListener('resize', handleResize);
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
