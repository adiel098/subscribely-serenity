import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { LoadingScreen } from "@/telegram-mini-app/components/LoadingScreen";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { EmailCollectionForm } from "@/telegram-mini-app/components/EmailCollectionForm";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { useTelegramUser } from "@/telegram-mini-app/hooks/useTelegramUser";
import { useCommunityData } from "@/telegram-mini-app/hooks/useCommunityData";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info, RefreshCw } from "lucide-react";
import { checkUserExists } from "@/telegram-mini-app/services/memberService";
import { Button } from "@/components/ui/button";
import { initTelegramWebApp, isDevelopment } from "@/telegram-mini-app/utils/telegramUtils";

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [telegramInitialized, setTelegramInitialized] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const { toast } = useToast();

  const startParam = searchParams.get("start");

  useEffect(() => {
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    console.log('📱 Telegram WebApp initialized:', initialized);
  }, []);

  useEffect(() => {
    const devEnvironment = isDevelopment();
    setIsDevelopment(devEnvironment);
    
    if (devEnvironment && !window.Telegram?.WebApp) {
      console.log('🧪 Running in development mode without Telegram WebApp object');
    }
  }, []);

  console.log('💫 TelegramMiniApp initialized with:');
  console.log('📌 startParam:', startParam);
  console.log('📌 URL:', window.location.href);

  if (window.Telegram?.WebApp) {
    console.log('📱 Telegram WebApp object is available:');
    console.log('📌 Full WebApp object:', window.Telegram.WebApp);
    console.log('📌 initData:', window.Telegram.WebApp.initData);
    console.log('📌 initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);
    if (window.Telegram.WebApp.initDataUnsafe?.user) {
      console.log('👤 User from WebApp:', window.Telegram.WebApp.initDataUnsafe.user);
      console.log('🆔 User ID from WebApp:', window.Telegram.WebApp.initDataUnsafe.user.id);
      console.log('🆔 User ID type:', typeof window.Telegram.WebApp.initDataUnsafe.user.id);
    }
  } else {
    console.log('❌ Telegram WebApp object is NOT available');
  }

  const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
  console.log('🔑 Direct telegram user ID extraction:', telegramUserId);
  console.log('🔑 Direct telegram user ID type:', typeof telegramUserId);

  const effectiveStartParam = isDevelopment && !startParam ? "dev123" : startParam;

  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { user: telegramUser, loading: userLoading, error: userError, refetch: refetchUser } = 
    useTelegramUser(effectiveStartParam || "", telegramUserId);

  console.log('📡 Hook Results:');
  console.log('📌 Community loading:', communityLoading);
  console.log('📌 Community data:', community);
  console.log('📌 User loading:', userLoading);
  console.log('📌 User data:', telegramUser);
  console.log('📌 User error:', userError);
  console.log('📌 Direct telegramUserId:', telegramUserId);

  useEffect(() => {
    const checkUserData = async () => {
      if (!userLoading && telegramUser) {
        console.log('✅ User data loaded, checking if user exists in database');
        setIsCheckingUserData(true);
        
        try {
          if (!telegramUser.id || !/^\d+$/.test(telegramUser.id)) {
            console.error('❌ Invalid Telegram ID format for database check:', telegramUser.id);
            setErrorState("Invalid Telegram user ID format");
            setIsCheckingUserData(false);
            return;
          }
          
          const { exists, hasEmail } = await checkUserExists(telegramUser.id);
          console.log('📊 User exists:', exists, 'Has email:', hasEmail);
          
          setShowEmailForm(!hasEmail);
          setErrorState(null);
        } catch (error) {
          console.error('❌ Error checking user data:', error);
          setShowEmailForm(!telegramUser.email);
        } finally {
          setIsCheckingUserData(false);
        }
      }
    };

    checkUserData();
  }, [telegramUser, userLoading]);

  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      setErrorState("User identification error. Please try reloading the app or contact support.");
      
      toast({
        variant: "destructive",
        title: "User Data Error",
        description: "There was a problem retrieving your information. Some features may be limited."
      });
    }
  }, [userError, toast]);

  const handleEmailFormComplete = () => {
    console.log('📧 Email form completed');
    setShowEmailForm(false);
  };

  const handleRetry = () => {
    console.log('🔄 Retrying user data fetch');
    setErrorState(null);
    setIsCheckingUserData(true);
    refetchUser();
    
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to Telegram...",
    });
  };

  if (errorState && telegramUserId) {
    console.log('🔄 We have an error but also have a direct telegramUserId:', telegramUserId);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-sm border border-red-100">
          <div className="space-y-2 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-red-700">User Identification Error</h1>
            <p className="text-gray-500 text-sm">
              {errorState}
            </p>
          </div>
          
          <Button 
            onClick={handleRetry}
            className="w-full bg-primary/90 hover:bg-primary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Connection
          </Button>
          
          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-xs text-center text-gray-400">
              Error details: Unable to properly identify your Telegram account.
              <br/>Technical ID: {telegramUserId || "Not available"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (communityLoading || userLoading || isCheckingUserData) {
    console.log('⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  if (!community) {
    console.log('❌ Community not found');
    return <CommunityNotFound />;
  }

  if (showEmailForm && telegramUser) {
    console.log('📝 Showing email collection form for user ID:', telegramUser.id);
    return (
      <EmailCollectionForm 
        telegramUserId={telegramUser.id} 
        firstName={telegramUser.first_name}
        lastName={telegramUser.last_name}
        username={telegramUser.username}
        photoUrl={telegramUser.photo_url}
        onComplete={handleEmailFormComplete} 
      />
    );
  }

  console.log('🎉 Showing main content with:', { 
    community: community?.name, 
    user: telegramUser?.username,
    plans: community?.subscription_plans?.length || 0
  });
  
  return (
    <>
      {isDevelopment && (
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
      )}
      {community && <MainContent community={community} telegramUser={telegramUser} />}
    </>
  );
};

export default TelegramMiniApp;
