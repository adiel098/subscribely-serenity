
import { useState, useEffect, useCallback } from "react";
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

// Initialize Telegram WebApp
const initTelegramWebApp = () => {
  try {
    if (window.Telegram?.WebApp) {
      console.log('📱 WebApp is already initialized');
      
      // Set the correct viewport
      if (window.Telegram.WebApp.setViewport) {
        console.log('📏 Setting viewport');
        window.Telegram.WebApp.setViewport();
      }
      
      // Expand the WebApp to maximum available height
      if (window.Telegram.WebApp.expand) {
        console.log('📏 Expanding WebApp');
        window.Telegram.WebApp.expand();
      }
      
      // Mark as ready
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
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
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
  console.log('📌 Retry Count:', retryCount);
  
  // Log Telegram WebApp object if available
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

  // Create a default community ID for development mode
  const effectiveStartParam = isDevelopment && !startParam ? "dev123" : startParam;

  // Use our custom hooks to retrieve data
  const { loading: communityLoading, community } = useCommunityData(effectiveStartParam);
  const { user: telegramUser, loading: userLoading, error: userError, refetch } = 
    useTelegramUser(effectiveStartParam || "");
    
  console.log('📡 Hook Results:');
  console.log('📌 Community loading:', communityLoading);
  console.log('📌 Community data:', community);
  console.log('📌 User loading:', userLoading);
  console.log('📌 User data:', telegramUser);
  console.log('📌 User error:', userError);

  // Handle retry
  const handleRetry = useCallback(() => {
    console.log('🔄 Retrying user fetch...');
    setRetryCount(prev => prev + 1);
    setShowErrorDialog(false);
    refetch();
  }, [refetch]);

  // Check if user exists in the database and has an email
  useEffect(() => {
    const checkUserData = async () => {
      if (!userLoading && telegramUser) {
        console.log('✅ User data loaded, checking if user exists in database');
        setIsCheckingUserData(true);
        
        try {
          // CRITICAL FIX: Use telegramUser.id as the telegram_id for checking
          // This resolves the issue of repeated email prompts
          console.log('Checking user existence with ID:', telegramUser.id);
          const { exists, hasEmail } = await checkUserExists(telegramUser.id);
          console.log('📊 User exists:', exists, 'Has email:', hasEmail);
          
          // Only show email form if user doesn't have an email
          if (exists && hasEmail) {
            console.log('✅ User exists and has email, skipping email form');
            setShowEmailForm(false);
          } else {
            console.log('⚠️ User either doesn\'t exist or doesn\'t have an email, showing email form');
            setShowEmailForm(true);
          }
        } catch (error) {
          console.error('❌ Error checking user data:', error);
          // If there's an error, fall back to checking if email exists in user object
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

  // Handle errors from user data fetching
  useEffect(() => {
    if (userError) {
      console.error("❌ Error getting user data:", userError);
      setShowErrorDialog(true);
      toast({
        variant: "destructive",
        title: "User Identification Error",
        description: "There was a problem retrieving your information. Please try again."
      });
    }
  }, [userError, toast]);

  const handleEmailFormComplete = () => {
    console.log('📧 Email form completed');
    setShowEmailForm(false);
  };

  // Show loading screen while fetching data
  if (communityLoading || userLoading || isCheckingUserData) {
    console.log('⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  // Show error if community not found
  if (!community) {
    console.log('❌ Community not found');
    return <CommunityNotFound />;
  }

  // Show email collection form if needed
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

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              User Identification Error
            </DialogTitle>
            <DialogDescription>
              We couldn't identify your Telegram account. This may happen if:
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>The app was opened outside of Telegram</li>
                <li>There's a connection issue with Telegram servers</li>
                <li>The session data is invalid or expired</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleRetry} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ensure community data is properly passed to MainContent */}
      {community && telegramUser && <MainContent community={community} telegramUser={telegramUser} />}
    </>
  );
};

export default TelegramMiniApp;
