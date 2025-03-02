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
import { AlertTriangle, Info } from "lucide-react";
import { checkUserExists } from "@/telegram-mini-app/services/memberService";

const initTelegramWebApp = () => {
  try {
    if (window.Telegram?.WebApp) {
      console.log('📱 WebApp is already initialized');
      
      if (window.Telegram.WebApp.setViewport) {
        console.log('📏 Setting viewport');
        window.Telegram.WebApp.setViewport();
      }
      
      if (window.Telegram.WebApp.expand) {
        console.log('📏 Expanding WebApp');
        window.Telegram.WebApp.expand();
      }
      
      if (window.Telegram.WebApp.ready) {
        console.log('🚀 Marking WebApp as ready');
        window.Telegram.WebApp.ready();
      }
      
      return true;
    } else {
      console.log('❌ WebApp object is not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Error initializing Telegram WebApp:', error);
    return false;
  }
};

const TelegramMiniApp = () => {
  const [searchParams] = useSearchParams();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isCheckingUserData, setIsCheckingUserData] = useState(true);
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [telegramInitialized, setTelegramInitialized] = useState(false);
  const { toast } = useToast();

  const startParam = searchParams.get("start");
  
  useEffect(() => {
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    console.log('📱 Telegram WebApp initialized:', initialized);
  }, []);
  
  useEffect(() => {
    const devEnvironment = 
      process.env.NODE_ENV === 'development' || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
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
    }
  } else {
    console.log('❌ Telegram WebApp object is NOT available');
  }

  const effectiveStartParam = isDevelopment && !startParam ? "dev123" : startParam;

  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { user: telegramUser, loading: userLoading, error: userError } = 
    useTelegramUser(effectiveStartParam || "");

  console.log('📡 Hook Results:');
  console.log('📌 Community loading:', communityLoading);
  console.log('📌 Community data:', community);
  console.log('📌 User loading:', userLoading);
  console.log('📌 User data:', telegramUser);
  console.log('📌 User error:', userError);

  useEffect(() => {
    const checkUserData = async () => {
      if (!userLoading && telegramUser) {
        console.log('✅ User data loaded, checking if user exists in database');
        setIsCheckingUserData(true);
        
        try {
          console.log('🔍 Checking user existence with Telegram ID:', telegramUser.id);
          
          if (!telegramUser.id || typeof telegramUser.id !== 'string' || !/^\d+$/.test(telegramUser.id)) {
            console.error('❌ Invalid Telegram ID format:', telegramUser.id);
            setShowEmailForm(true);
            return;
          }
          
          const { exists, hasEmail } = await checkUserExists(telegramUser.id);
          console.log('📊 User exists:', exists, 'Has email:', hasEmail);
          
          if (exists && hasEmail) {
            console.log('✅ User exists and has email, skipping email form');
            setShowEmailForm(false);
          } else {
            console.log('⚠️ User either doesn\'t exist or doesn\'t have an email, showing email form');
            setShowEmailForm(true);
          }
        } catch (error) {
          console.error('❌ Error checking user data:', error);
          const hasEmailInUserObject = !!telegramUser.email;
          console.log('📊 Fallback: Has email in user object:', hasEmailInUserObject);
          setShowEmailForm(!hasEmailInUserObject);
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
