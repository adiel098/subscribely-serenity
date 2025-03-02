
import { useState, useEffect } from "react";
import { LoadingScreen } from "@/telegram-mini-app/components/LoadingScreen";
import { CommunityNotFound } from "@/telegram-mini-app/components/CommunityNotFound";
import { MainContent } from "@/telegram-mini-app/components/MainContent";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { checkUserExists } from "@/telegram-mini-app/services/userProfileService";
import { useToast } from "@/components/ui/use-toast";
import { Community } from "@/telegram-mini-app/types/community.types";
import { EmailCollectionWrapper } from "./EmailCollectionWrapper";
import { ErrorDisplay } from "./ErrorDisplay";

interface AppContentProps {
  communityLoading: boolean;
  userLoading: boolean;
  isCheckingUserData: boolean;
  community: Community | null;
  telegramUser: TelegramUser | null;
  errorState: string | null;
  telegramUserId: string | null;
  onRefetch: () => void;
  onRetry: () => void;
  setShowEmailForm: (show: boolean) => void;
  showEmailForm: boolean;
  setIsCheckingUserData: (isChecking: boolean) => void;
  setErrorState: (error: string | null) => void;
}

export const AppContent: React.FC<AppContentProps> = ({
  communityLoading,
  userLoading,
  isCheckingUserData,
  community,
  telegramUser,
  errorState,
  telegramUserId,
  onRefetch,
  onRetry,
  setShowEmailForm,
  showEmailForm,
  setIsCheckingUserData,
  setErrorState
}) => {
  const { toast } = useToast();
  const [loadingTime, setLoadingTime] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Add loading timer to help detect long loads
  useEffect(() => {
    let interval: number | null = null;
    
    if (communityLoading || userLoading || isCheckingUserData) {
      interval = window.setInterval(() => {
        setLoadingTime(prev => prev + 1);
      }, 1000);
    } else {
      setLoadingTime(0);
      if (interval) window.clearInterval(interval);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [communityLoading, userLoading, isCheckingUserData]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (loadingTime > 15 && !errorState) {
      console.error('Loading timeout reached - forcing error state');
      setErrorState("Loading timeout reached. Please try refreshing the page.");
      setIsCheckingUserData(false);
    }
  }, [loadingTime, errorState, setErrorState, setIsCheckingUserData]);

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
          
          if (!exists || !hasEmail) {
            // If user doesn't exist in DB or doesn't have an email, show email form
            console.log('🔍 User needs to provide email before proceeding');
            setShowEmailForm(true);
          } else {
            setShowEmailForm(false);
          }
          setErrorState(null);
        } catch (error) {
          console.error('❌ Error checking user data:', error);
          // Default to showing email form if there's an error checking the database
          setShowEmailForm(true);
        } finally {
          setIsCheckingUserData(false);
        }
      }
    };

    checkUserData();
  }, [telegramUser, userLoading, setIsCheckingUserData, setShowEmailForm, setErrorState]);

  useEffect(() => {
    if (errorState) {
      toast({
        variant: "destructive",
        title: "User Data Error",
        description: "There was a problem retrieving your information. Some features may be limited."
      });
    }
  }, [errorState, toast]);

  // Handle debug info visibility
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  // Handle error state but with valid user ID
  if (errorState && telegramUserId) {
    console.log('🔄 We have an error but also have a direct telegramUserId:', telegramUserId);
    return (
      <ErrorDisplay 
        errorMessage={errorState}
        telegramUserId={telegramUserId}
        onRetry={onRetry}
      />
    );
  }

  // Loading state with debug info
  if (communityLoading || userLoading || isCheckingUserData) {
    console.log('⏳ Showing loading screen');
    return (
      <div>
        <LoadingScreen />
        
        {/* Debug info that can be shown after clicking 5 times */}
        {loadingTime > 5 && (
          <div className="fixed bottom-4 right-4">
            <button 
              onClick={toggleDebugInfo}
              className="bg-gray-800 text-white p-2 rounded-full text-xs"
            >
              {showDebugInfo ? "Hide Debug" : "Debug"}
            </button>
          </div>
        )}
        
        {showDebugInfo && (
          <div className="fixed bottom-12 right-4 bg-black/80 text-white p-3 rounded text-xs max-w-[300px] z-50">
            <h4 className="font-bold">Debug Info:</h4>
            <p>Loading time: {loadingTime}s</p>
            <p>Community loading: {String(communityLoading)}</p>
            <p>User loading: {String(userLoading)}</p>
            <p>Checking user data: {String(isCheckingUserData)}</p>
            <p>Telegram user ID: {telegramUserId || "none"}</p>
            <button 
              onClick={onRetry}
              className="mt-2 bg-blue-500 text-white p-1 rounded text-xs w-full"
            >
              Force Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // Missing community
  if (!community) {
    console.log('❌ Community not found');
    return <CommunityNotFound />;
  }

  // Show email form
  if (showEmailForm && telegramUser) {
    console.log('📧 Showing email collection form for user:', telegramUser.username);
    return (
      <EmailCollectionWrapper 
        telegramUser={telegramUser} 
        onComplete={() => setShowEmailForm(false)}
      />
    );
  }

  // Main content
  console.log('🎉 Showing main content with:', { 
    community: community?.name, 
    user: telegramUser?.username,
    plans: community?.subscription_plans?.length || 0
  });
  
  return <MainContent community={community} telegramUser={telegramUser} />;
};
