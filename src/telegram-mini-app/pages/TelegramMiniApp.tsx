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
  const [showEmailForm, setShowEmailForm] = useState(true);
  const [isCheckingUserData, setIsCheckingUserData] = useState(false);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const [telegramInitialized, setTelegramInitialized] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  const startParam = searchParams.get("start");
  
  console.log('💫 TelegramMiniApp initialized with:');
  console.log('📌 startParam:', startParam);
  console.log('📌 URL:', window.location.href);
  console.log('📌 isDevelopmentMode:', isDevelopmentMode);
  console.log('📌 retryCount:', retryCount);
  console.log('📌 User Agent:', navigator.userAgent);

  useEffect(() => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setIsDevelopmentMode(true);
    }
    
    ensureFullScreen();
    
    const timeoutId = setTimeout(() => {
      ensureFullScreen();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);

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
      
      ensureFullScreen();
    } else {
      console.log('❌ Telegram WebApp object is NOT available');
    }
  }, [telegramInitialized]);

  let telegramUserId = null;
  
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    telegramUserId = String(window.Telegram.WebApp.initDataUnsafe.user.id).trim();
    console.log('🔑 Direct user ID extracted from WebApp:', telegramUserId);
  } else if (isDevelopmentMode) {
    telegramUserId = "12345678";
    console.log('🔑 Using mock ID for development:', telegramUserId);
  }
  
  console.log('🔑 Final telegram user ID:', telegramUserId);
  
  const handleTelegramInitialized = (isInitialized: boolean, isDev: boolean) => {
    setTelegramInitialized(isInitialized);
    setIsDevelopmentMode(prev => prev || isDev);
    
    if (isInitialized && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      const userId = String(window.Telegram.WebApp.initDataUnsafe.user.id).trim();
      console.log('🔑 User ID after initialization:', userId);
    }
    
    ensureFullScreen();
  };

  const effectiveStartParam = isDevelopmentMode && !startParam ? "dev123" : startParam;
  console.log('📌 Effective startParam:', effectiveStartParam);

  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { user: telegramUser, loading: userLoading, error: userError, refetch: refetchUser } = 
    useTelegramUser(effectiveStartParam || "", telegramUserId);

  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      setErrorState("User identification error. Please try reloading the app or contact support.");
    }
  }, [userError]);

  useEffect(() => {
    let timeout: number | null = null;
    
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

  const handleRetry = () => {
    console.log('🔄 Retrying user data fetch');
    setErrorState(null);
    setIsCheckingUserData(false);
    setRetryCount(prev => prev + 1);
    refetchUser();
    
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    
    ensureFullScreen();
    
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to Telegram...",
    });
  };

  useEffect(() => {
    console.log('📧 EMAIL FORM STATE CHANGED:', showEmailForm ? 'SHOWING' : 'HIDDEN');
  }, [showEmailForm]);

  useEffect(() => {
    if (!userLoading && telegramUser) {
      if (telegramUser.email) {
        console.log('📧 User has email, hiding email form:', telegramUser.email);
        setShowEmailForm(false);
      } else {
        console.log('📧 User loaded without email - keeping email form visible');
        setShowEmailForm(true);
      }
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
