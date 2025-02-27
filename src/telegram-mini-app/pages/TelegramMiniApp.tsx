
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { useEmailFormStatus } from "@/telegram-mini-app/hooks/useEmailFormStatus";
import { TelegramAppContent } from "@/telegram-mini-app/components/TelegramAppContent";
import { 
  initTelegramWebApp, 
  isDevelopmentMode, 
  logTelegramWebAppInfo 
} from "@/telegram-mini-app/utils/telegramWebApp";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [telegramInitialized, setTelegramInitialized] = useState(false);
  const { toast } = useToast();

  // Get start parameter from URL
  const startParam = searchParams.get("start");
  
  // Initialize Telegram WebApp
  useEffect(() => {
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    console.log('📱 Telegram WebApp initialized:', initialized);
  }, []);
  
  // Check if we're in development mode
  useEffect(() => {
    const devEnvironment = isDevelopmentMode();
    setIsDevelopment(devEnvironment);
    
    if (devEnvironment && !window.Telegram?.WebApp) {
      console.log('🧪 Running in development mode without Telegram WebApp object');
    }
  }, []);
  
  // Log initialization info
  useEffect(() => {
    logTelegramWebAppInfo(startParam);
  }, [startParam]);

  // Create a default community ID for development mode
  const effectiveStartParam = isDevelopment && !startParam ? "dev123" : startParam;

  // Use our custom hooks to retrieve data
  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { user: telegramUser, loading: userLoading, error: userError } = 
    useTelegramUser(effectiveStartParam || "");
  
  // Handle email form status
  const { 
    showEmailForm, 
    isCheckingUserData, 
    handleEmailFormComplete 
  } = useEmailFormStatus(telegramUser, userLoading);

  // Handle errors from user data fetching
  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      toast({
        variant: "destructive",
        title: "User Data Error",
        description: "There was a problem retrieving your information. Some features may be limited."
      });
    }
  }, [userError, toast]);

  // Combine all loading states
  const isLoading = communityLoading || userLoading || isCheckingUserData;

  return (
    <TelegramAppContent
      isDevelopment={isDevelopment}
      telegramWebAppAvailable={telegramInitialized}
      isLoading={isLoading}
      community={community}
      telegramUser={telegramUser}
      showEmailForm={showEmailForm}
      onEmailFormComplete={handleEmailFormComplete}
    />
  );
};

export default TelegramMiniApp;
