
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { TelegramInitializer } from "@/telegram-mini-app/components/TelegramInitializer";
import AppContent from "@/telegram-mini-app/components/AppContent"; 
import { initTelegramWebApp, ensureFullScreen } from "@/telegram-mini-app/utils/telegramUtils";

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
  console.log('📌 User Agent:', navigator.userAgent);

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
      
      // Ensure we're in full screen mode
      ensureFullScreen();
    } else {
      console.log('❌ Telegram WebApp object is NOT available');
    }
  }, [telegramInitialized]);

  // Get Telegram user ID directly from WebApp object
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

  // Set effective start parameter - important change here!
  // When no start parameter is provided, we'll default to empty string
  // which will trigger the discovery view instead of showing an error
  const effectiveStartParam = startParam || "";
  
  // For development mode, we can still use a test community ID
  const finalStartParam = isDevelopmentMode && !effectiveStartParam 
    ? "27052464-6e68-4116-bd79-6af069fe67cd" // Use this only in dev mode for testing
    : effectiveStartParam;
    
  console.log('📌 Effective startParam:', finalStartParam);

  // Fetch data using hooks - we pass the empty string to trigger the discovery view
  const { community, loading: communityLoading } = useCommunityData(finalStartParam);
  const { user: telegramUser, loading: userLoading, error: userError, refetch: refetchUser } = 
    useTelegramUser(finalStartParam, telegramUserId);

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
    
    // Ensure full screen mode on retry
    ensureFullScreen();
    
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to Telegram...",
    });
  };

  // Debug email form state changes
  useEffect(() => {
    console.log('📧 EMAIL FORM STATE CHANGED:', showEmailForm ? 'SHOWING' : 'HIDDEN');
  }, [showEmailForm]);

  // CRITICAL FIX: Force email collection for users without email
  useEffect(() => {
    if (!userLoading && telegramUser && !telegramUser.email) {
      console.log('🚨 User loaded without email - this should trigger email collection:', telegramUser);
    }
  }, [telegramUser, userLoading]);

  return (
    <>
      <TelegramInitializer onInitialized={handleTelegramInitialized} />
      
      <AppContent
        communityId={finalStartParam}
        telegramUserId={telegramUserId}
      />
    </>
  );
};

export default TelegramMiniApp;
