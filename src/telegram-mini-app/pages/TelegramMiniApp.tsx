import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { TelegramInitializer } from "@/telegram-mini-app/components/TelegramInitializer";
import { AppContent } from "@/telegram-mini-app/components/AppContent";
import { AppInitializer } from "@/telegram-mini-app/components/app-initialization/AppInitializer";

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

  // Handle initialization callback
  const handleTelegramInitialized = (isInitialized: boolean, isDev: boolean) => {
    setTelegramInitialized(isInitialized);
    setIsDevelopmentMode(prev => prev || isDev);
  };

  // Set effective start parameter (use default in dev mode)
  const effectiveStartParam = isDevelopmentMode && !startParam ? "dev123" : startParam;
  console.log('📌 Effective startParam:', effectiveStartParam);

  // Get Telegram user ID directly from WebApp object using the method provided by the user
  let telegramUserId = null;
  
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    // Ensure we're working with a string
    telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString().trim();
    console.log('🔑 Direct user ID extracted from WebApp:', telegramUserId);
  } else if (isDevelopmentMode) {
    telegramUserId = "12345678"; // Mock ID for development
    console.log('🔑 Using mock ID for development:', telegramUserId);
  }
  
  console.log('🔑 Final telegram user ID:', telegramUserId);

  // Fetch data using hooks
  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { 
    user: telegramUser, 
    loading: userLoading, 
    error: userError, 
    refetch: refetchUser,
    userExistsInDatabase
  } = useTelegramUser(effectiveStartParam || "", telegramUserId);

  // Log hook results for debugging
  console.log('📡 Hook Results:');
  console.log('📌 Community loading:', communityLoading);
  console.log('📌 Community data:', community);
  console.log('📌 User loading:', userLoading);
  console.log('📌 User data:', telegramUser);
  console.log('📌 User exists in database:', userExistsInDatabase);
  console.log('📌 User error:', userError);
  console.log('📌 Email form should show:', showEmailForm);

  // Create memoized wrapper functions
  const handleShowEmailForm = useCallback((show: boolean) => {
    console.log('📧 Setting showEmailForm state:', show, 'Previous value:', showEmailForm);
    setShowEmailForm(show);
  }, [showEmailForm]);

  const handleIsCheckingUserData = useCallback((isChecking: boolean) => {
    console.log('🔍 Setting isCheckingUserData state:', isChecking, 'Previous value:', isCheckingUserData);
    setIsCheckingUserData(isChecking);
  }, [isCheckingUserData]);

  const handleErrorState = useCallback((error: string | null) => {
    console.log('❌ Setting errorState:', error);
    setErrorState(error);
  }, []);

  return (
    <AppInitializer
      startParam={startParam}
      isDevelopmentMode={isDevelopmentMode}
      setIsDevelopmentMode={setIsDevelopmentMode}
      telegramInitialized={telegramInitialized}
      setTelegramInitialized={setTelegramInitialized}
      communityLoading={communityLoading}
      userLoading={userLoading}
      retryCount={retryCount}
      setRetryCount={setRetryCount}
      setErrorState={setErrorState}
      isCheckingUserData={isCheckingUserData}
      setIsCheckingUserData={setIsCheckingUserData}
      refetchUser={refetchUser}
      userError={userError}
    >
      <TelegramInitializer onInitialized={handleTelegramInitialized} />
      <AppContent
        communityLoading={communityLoading}
        userLoading={userLoading}
        isCheckingUserData={isCheckingUserData}
        community={community}
        telegramUser={telegramUser}
        errorState={errorState}
        telegramUserId={telegramUserId}
        userExistsInDatabase={userExistsInDatabase}
        onRefetch={refetchUser}
        onRetry={() => {
          console.log('🔄 Retrying user data fetch');
          setErrorState(null);
          setIsCheckingUserData(true);
          setRetryCount(retryCount + 1);
          refetchUser();
        }}
        setShowEmailForm={setShowEmailForm}
        showEmailForm={showEmailForm}
        setIsCheckingUserData={setIsCheckingUserData}
        setErrorState={setErrorState}
      />
    </AppInitializer>
  );
};

export default TelegramMiniApp;
