
import { useState, useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { LoadingIndicator } from "@/telegram-mini-app/components/app-content/LoadingIndicator";
import { UserDataChecker } from "@/telegram-mini-app/components/app-content/UserDataChecker";
import { ErrorNotifier } from "@/telegram-mini-app/components/app-content/ErrorNotifier";
import { AppContentRouter } from "@/telegram-mini-app/components/app-content/AppContentRouter";
import { UILogger } from "@/telegram-mini-app/components/debug/UILogger";

interface AppContentProps {
  communityLoading: boolean;
  userLoading: boolean;
  isCheckingUserData: boolean;
  community: Community | null;
  telegramUser: TelegramUser | null;
  errorState: string | null;
  telegramUserId: string | null;
  userExistsInDatabase: boolean | null;
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
  userExistsInDatabase,
  onRefetch,
  onRetry,
  setShowEmailForm,
  showEmailForm,
  setIsCheckingUserData,
  setErrorState
}) => {
  // Track when email is submitted
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  
  // All component state and functionality is now split into smaller components
  const isLoading = communityLoading || userLoading || isCheckingUserData;
  
  // Log state changes for debugging
  useEffect(() => {
    console.log('📊 FLOW: AppContent state changed:', {
      communityLoading,
      userLoading,
      isCheckingUserData,
      hasUser: !!telegramUser,
      userExistsInDatabase,
      showEmailForm,
      isLoading,
      emailSubmitted
    });
    
    // If email was submitted but we're still showing the email form, force hide it
    if (emailSubmitted && showEmailForm) {
      console.log('🚨 FLOW: Email was submitted but form is still showing - forcing transition');
      setShowEmailForm(false);
    }
  }, [communityLoading, userLoading, isCheckingUserData, telegramUser, 
      showEmailForm, emailSubmitted, setShowEmailForm, userExistsInDatabase, isLoading]);

  return (
    <>
      {/* Error notifications */}
      <ErrorNotifier errorState={errorState} />
      
      {/* User data checking logic */}
      <UserDataChecker
        telegramUser={telegramUser}
        userLoading={userLoading}
        userExistsInDatabase={userExistsInDatabase}
        setIsCheckingUserData={setIsCheckingUserData}
        setShowEmailForm={setShowEmailForm}
        setErrorState={setErrorState}
      />
      
      {/* Loading screen with debug info */}
      <LoadingIndicator 
        isLoading={isLoading}
        onTimeout={() => {
          setErrorState("Loading timeout reached. Please try refreshing the page.");
          setIsCheckingUserData(false);
        }}
        onRetry={onRetry}
      />
      
      {/* Main routing logic */}
      <AppContentRouter
        loading={isLoading}
        errorState={errorState}
        telegramUserId={telegramUserId}
        community={community}
        telegramUser={telegramUser}
        userExistsInDatabase={userExistsInDatabase}
        showEmailForm={showEmailForm}
        isCheckingUserData={isCheckingUserData}
        onRetry={onRetry}
        setShowEmailForm={(show) => {
          console.log('📱 FLOW: Setting showEmailForm in AppContentRouter:', show);
          if (!show && showEmailForm) {
            // Email form is being hidden after being shown - mark as submitted
            setEmailSubmitted(true);
          }
          setShowEmailForm(show);
        }}
      />
      
      {/* UI Logger component */}
      <UILogger />
    </>
  );
};
