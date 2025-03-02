
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { TelegramInitializer } from "@/telegram-mini-app/components/TelegramInitializer";
import { AppContent } from "@/telegram-mini-app/components/AppContent";
import { initTelegramWebApp } from "@/telegram-mini-app/utils/telegramUtils";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [showEmailForm, setShowEmailForm] = useState(false);
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
  }, []);

  // Log Telegram WebApp object if available
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      console.log('📱 Telegram WebApp object is available:');
      console.log('📌 Full WebApp object:', window.Telegram.WebApp);
      console.log('📌 initData:', window.Telegram.WebApp.initData);
      console.log('📌 initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        console.log('👤 User from WebApp:', window.Telegram.WebApp.initDataUnsafe.user);
        console.log('🆔 User ID from WebApp:', window.Telegram.WebApp.initDataUnsafe.user.id);
        console.log('🆔 User ID type:', typeof window.Telegram.WebApp.initDataUnsafe.user.id);
      } else {
        console.log('❌ No user data in WebApp.initDataUnsafe');
      }
    } else {
      console.log('❌ Telegram WebApp object is NOT available');
    }
  }, [telegramInitialized]);

  // Get Telegram user ID directly from WebApp object
  const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString() || 
                         (isDevelopmentMode ? "12345678" : null);
  
  // Use mock user ID in development mode if none provided
  const effectiveTelegramUserId = isDevelopmentMode && !telegramUserId ? "12345678" : telegramUserId;
  
  console.log('🔑 Direct telegram user ID extraction:', telegramUserId);
  console.log('🔑 Effective telegram user ID:', effectiveTelegramUserId);
  console.log('🔑 Direct telegram user ID type:', typeof telegramUserId);

  // Handle initialization callback
  const handleTelegramInitialized = (isInitialized: boolean, isDev: boolean) => {
    setTelegramInitialized(isInitialized);
    setIsDevelopmentMode(prev => prev || isDev);
  };

  // Set effective start parameter (use default in dev mode)
  const effectiveStartParam = isDevelopmentMode && !startParam ? "dev123" : startParam;
  console.log('📌 Effective startParam:', effectiveStartParam);

  // Fetch data using hooks
  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { user: telegramUser, loading: userLoading, error: userError, refetch: refetchUser } = 
    useTelegramUser(effectiveStartParam || "", effectiveTelegramUserId);

  // Log hook results for debugging
  console.log('📡 Hook Results:');
  console.log('📌 Community loading:', communityLoading);
  console.log('📌 Community data:', community);
  console.log('📌 User loading:', userLoading);
  console.log('📌 User data:', telegramUser);
  console.log('📌 User error:', userError);
  console.log('📌 Direct telegramUserId:', telegramUserId);
  console.log('📌 Effective telegramUserId:', effectiveTelegramUserId);

  // Handle user error
  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      setErrorState("User identification error. Please try reloading the app or contact support.");
    }
  }, [userError]);

  // Auto retry once if loading takes too long
  useEffect(() => {
    let timeout: number | null = null;
    
    // If we're in loading state for more than 10 seconds and retry count is 0, auto retry
    if ((communityLoading || userLoading) && retryCount === 0) {
      timeout = window.setTimeout(() => {
        console.log('🔄 Auto retrying due to long loading time');
        handleRetry();
      }, 10000);
    }
    
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [communityLoading, userLoading, retryCount]);

  // Handle retry button click
  const handleRetry = () => {
    console.log('🔄 Retrying user data fetch');
    setErrorState(null);
    setIsCheckingUserData(true);
    setRetryCount(prev => prev + 1);
    refetchUser();
    
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to Telegram...",
    });
  };

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
        telegramUserId={effectiveTelegramUserId}
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
