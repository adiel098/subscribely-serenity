
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
    // Detect development mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setIsDevelopmentMode(true);
    }
    
    // Apply immediate tg.expand() if available
    if (window.Telegram?.WebApp?.expand) {
      console.log('📱 Initial tg.expand() call');
      window.Telegram.WebApp.expand();
    }
    
    ensureFullScreen();
    
    // Apply delayed tg.expand() as well
    const expandTimeouts = [100, 500, 1000].map(delay => 
      setTimeout(() => {
        if (window.Telegram?.WebApp?.expand) {
          console.log(`📱 Delayed tg.expand() after ${delay}ms`);
          window.Telegram.WebApp.expand();
        }
        ensureFullScreen();
      }, delay)
    );
    
    return () => expandTimeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      console.log('📱 Telegram WebApp object is available');
      
      // Call tg.expand() directly
      if (window.Telegram.WebApp.expand) {
        window.Telegram.WebApp.expand();
      }
      
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        console.log('👤 User from WebApp:', window.Telegram.WebApp.initDataUnsafe.user);
        console.log('🆔 User ID from WebApp:', window.Telegram.WebApp.initDataUnsafe.user.id);
      } else {
        console.log('❌ No user data in WebApp.initDataUnsafe');
      }
      
      ensureFullScreen();
    } else {
      console.log('❌ Telegram WebApp object is NOT available');
    }
  }, [telegramInitialized]);

  let telegramUserId = null;
  
  // Extract Telegram User ID with multiple fallbacks
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
    
    // Re-extract user ID if needed after initialization
    if (isInitialized && window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      const userId = String(window.Telegram.WebApp.initDataUnsafe.user.id).trim();
      console.log('🔑 User ID after initialization:', userId);
    }
    
    // Use tg.expand directly
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
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
    // Always attempt to force fullscreen after user data loads
    if (!userLoading && window.Telegram?.WebApp?.expand) {
      console.log('📱 tg.expand() after user data loaded');
      window.Telegram.WebApp.expand();
      ensureFullScreen();
    }
  }, [userLoading]);

  const handleRetry = () => {
    console.log('🔄 Retrying user data fetch');
    setErrorState(null);
    setIsCheckingUserData(false);
    setRetryCount(prev => prev + 1);
    refetchUser();
    
    // Re-initialize and expand
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }
    
    ensureFullScreen();
    
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to Telegram...",
    });
  };

  useEffect(() => {
    // Log email form state change
    console.log('📧 EMAIL FORM STATE CHANGED:', showEmailForm ? 'SHOWING' : 'HIDDEN');
    
    // Always force expansion when email form state changes
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }
  }, [showEmailForm]);

  useEffect(() => {
    // Determine whether to show email form based on user data
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
