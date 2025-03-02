
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { TelegramInitializer } from "@/telegram-mini-app/components/TelegramInitializer";
import { AppContent } from "@/telegram-mini-app/components/AppContent";
import { initTelegramWebApp, ensureFullScreen } from "@/telegram-mini-app/utils/telegramUtils";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [showEmailForm, setShowEmailForm] = useState(true); // Default to showing email form
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const [telegramInitialized, setTelegramInitialized] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const startParam = searchParams.get("start");
  
  // Debug URL and parameters
  console.log('💫 TelegramMiniApp initialized with:');
  console.log('📌 startParam:', startParam);
  console.log('📌 URL:', window.location.href);
  console.log('📌 isDevelopmentMode:', isDevelopmentMode);
  console.log('📌 retryCount:', retryCount);

  // Force development mode on localhost
  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setIsDevelopmentMode(true);
    }
    
    // Ensure full screen mode
    ensureFullScreen();
    
    // Add additional calls to ensure full screen after component is fully mounted
    const timeoutId = setTimeout(() => {
      ensureFullScreen();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Get Telegram user ID directly from WebApp object as suggested
  let telegramUserId = null;
  
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    // Ensure we're working with a string
    telegramUserId = String(window.Telegram.WebApp.initDataUnsafe.user.id).trim();
    console.log('🔑 Direct user ID extracted from WebApp:', telegramUserId);
  } else if (isDevelopmentMode) {
    telegramUserId = "12345678"; // Mock ID for development
    console.log('🔑 Using mock ID for development:', telegramUserId);
  }
  
  console.log('🔑 Final telegram user ID:', telegramUserId);
  
  // Handle initialization callback
  const handleTelegramInitialized = (isInitialized: boolean, isDev: boolean) => {
    setTelegramInitialized(isInitialized);
    setIsDevelopmentMode(prev => prev || isDev);
    
    // Recheck telegram user ID after initialization
    if (isInitialized && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      const userId = String(window.Telegram.WebApp.initDataUnsafe.user.id).trim();
      console.log('🔑 User ID after initialization:', userId);
    }
    
    // Ensure full screen mode after initialization
    ensureFullScreen();
  };

  // Set effective start parameter (use default in dev mode)
  const effectiveStartParam = isDevelopmentMode && !startParam ? "dev123" : startParam;
  console.log('📌 Effective startParam:', effectiveStartParam);

  // Fetch data using hooks
  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { user: telegramUser, loading: userLoading, error: userError, refetch: refetchUser } = 
    useTelegramUser(effectiveStartParam || "", telegramUserId);

  // Log hook results for debugging
  console.log('📡 Hook Results:');
  console.log('📌 Community loading:', communityLoading);
  console.log('📌 Community data:', community);
  console.log('📌 User loading:', userLoading);
  console.log('📌 User data:', telegramUser);
  console.log('📌 User error:', userError);
  console.log('📌 Email form should show:', showEmailForm);
  console.log('📌 Direct telegramUserId:', telegramUserId);

  // Handle user error
  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      setErrorState("User identification error. Please try reloading the app or contact support.");
    }
  }, [userError]);

  // Handle retry button click
  const handleRetry = () => {
    console.log('🔄 Retrying user data fetch');
    setErrorState(null);
    setIsCheckingUserData(true);
    setRetryCount(prev => prev + 1);
    refetchUser();
    
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    
    // Ensure full screen mode on retry
    ensureFullScreen();
    
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to Telegram...",
    });
  };

  // CRITICAL FIX: Force email collection for users without email
  useEffect(() => {
    if (!userLoading && telegramUser && !telegramUser.email) {
      console.log('🚨 User loaded without email - forcing email collection:', telegramUser);
      setShowEmailForm(true);
    }
  }, [telegramUser, userLoading]);

  return (
    <>
      <TelegramInitializer onInitialized={handleTelegramInitialized} />
      <AppContent
        communityLoading={communityLoading}
        userLoading={userLoading}
        isCheckingUserData={isCheckingUserData}
        community={community}
        telegramUser={telegramUser}
        errorState={errorState}
        telegramUserId={telegramUserId}
        onRefetch={refetchUser}
        onRetry={handleRetry}
        setShowEmailForm={setShowEmailForm}
        showEmailForm={showEmailForm}
        setIsCheckingUserData={setIsCheckingUserData}
        setErrorState={setErrorState}
      />
    </>
  );
};

export default TelegramMiniApp;
