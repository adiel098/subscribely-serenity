
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { TelegramInitializer } from "@/telegram-mini-app/components/TelegramInitializer";
import AppContent from "@/telegram-mini-app/components/AppContent"; 
import { initTelegramWebApp, ensureFullScreen } from "@/telegram-mini-app/utils/telegramUtils";
import { DebugMenu } from "../components/debug/DebugMenu";
import { getWebAppData, getProjectIdFromStartParam } from "../utils/webAppDataExtractor";
import { createLogger } from "../utils/debugUtils";

const logger = createLogger("TelegramMiniApp");

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
  
  logger.log('💫 TelegramMiniApp initialized with:');
  logger.log('📌 startParam:', startParam);
  logger.log('📌 URL:', window.location.href);
  logger.log('📌 isDevelopmentMode:', isDevelopmentMode);
  logger.log('📌 retryCount:', retryCount);
  logger.log('📌 User Agent:', navigator.userAgent);

  // Check if startParam is a project ID
  const projectId = getProjectIdFromStartParam(startParam);
  logger.log('📌 Extracted projectId:', projectId);

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

  // Extract Telegram user ID directly for debugging purposes
  let directTelegramUserId = null;
  
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    directTelegramUserId = String(window.Telegram.WebApp.initDataUnsafe.user.id).trim();
    logger.log('🔑 Direct user ID found in WebApp:', directTelegramUserId);
  } else if (isDevelopmentMode) {
    directTelegramUserId = "12345678";
    logger.log('🔑 Using mock ID for development:', directTelegramUserId);
  } else {
    logger.log('❌ No direct Telegram user ID found in WebApp');
  }

  const handleTelegramInitialized = (isInitialized: boolean, isDev: boolean) => {
    logger.log('Telegram initialized:', isInitialized, 'isDev:', isDev);
    setTelegramInitialized(isInitialized);
    setIsDevelopmentMode(prev => prev || isDev);
    
    if (isInitialized) {
      // Try to get user again after initialization
      const telegramUser = getWebAppData();
      logger.log('User after initialization:', telegramUser);
    }
    
    ensureFullScreen();
  };

  // Determine what to pass to hooks - project ID or community ID
  const effectiveStartParam = projectId ? `project_${projectId}` : (startParam || "");
  
  const finalStartParam = isDevelopmentMode && !effectiveStartParam 
    ? "27052464-6e68-4116-bd79-6af069fe67cd"
    : effectiveStartParam;
    
  logger.log('📌 Effective startParam:', finalStartParam);

  const { community, loading: communityLoading } = useCommunityData(finalStartParam);
  const { user: telegramUser, loading: userLoading, error: userError, refetch: refetchUser } = 
    useTelegramUser(finalStartParam, directTelegramUserId);

  logger.log('📡 Hook Results:');
  logger.log('📌 Community loading:', communityLoading);
  logger.log('📌 Community data:', community);
  logger.log('📌 User loading:', userLoading);
  logger.log('📌 User data:', telegramUser);
  logger.log('📌 User error:', userError);

  useEffect(() => {
    if (userError) {
      logger.error("❌ Error getting user data:", userError);
      setErrorState("User identification error. Please try reloading the app or contact support.");
    }
  }, [userError]);

  useEffect(() => {
    let timeout: number | null = null;
    
    if ((communityLoading || userLoading) && retryCount === 0) {
      timeout = window.setTimeout(() => {
        logger.log('🔄 Auto retrying due to long loading time');
        handleRetry();
      }, 10000);
    }
    
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [communityLoading, userLoading, retryCount]);

  const handleRetry = () => {
    logger.log('🔄 Retrying user data fetch');
    setErrorState(null);
    setIsCheckingUserData(true);
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

  return (
    <div className="pb-32 pt-8 px-4 max-w-lg mx-auto">
      <TelegramInitializer onInitialized={handleTelegramInitialized} />
      
      <AppContent
        communityId={projectId ? undefined : finalStartParam}
        projectId={projectId}
        telegramUserId={telegramUser?.id || directTelegramUserId}
      />
      
      <DebugMenu />
    </div>
  );
};

export default TelegramMiniApp;
