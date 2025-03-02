import { useState, useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { LoadingIndicator } from "@/telegram-mini-app/components/app-content/LoadingIndicator";
import { UserDataChecker } from "@/telegram-mini-app/components/app-content/UserDataChecker";
import { ErrorNotifier } from "@/telegram-mini-app/components/app-content/ErrorNotifier";
import { AppContentRouter } from "@/telegram-mini-app/components/app-content/AppContentRouter";
import { UILogger } from "@/telegram-mini-app/components/debug/UILogger";
import { TelegramDebugPanel } from "@/telegram-mini-app/components/debug/TelegramDebugPanel";

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
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  
  const isLoading = communityLoading || userLoading || isCheckingUserData;
  
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
    
    if (emailSubmitted && showEmailForm) {
      console.log('🚨 FLOW: Email was submitted but form is still showing - forcing transition');
      setShowEmailForm(false);
    }
  }, [communityLoading, userLoading, isCheckingUserData, telegramUser, 
      showEmailForm, emailSubmitted, setShowEmailForm, userExistsInDatabase, isLoading]);

  return (
    <>
      <ErrorNotifier errorState={errorState} />
      
      <UserDataChecker
        telegramUser={telegramUser}
        userLoading={userLoading}
        userExistsInDatabase={userExistsInDatabase}
        setIsCheckingUserData={setIsCheckingUserData}
        setShowEmailForm={setShowEmailForm}
        setErrorState={setErrorState}
      />
      
      <LoadingIndicator 
        isLoading={isLoading}
        onTimeout={() => {
          setErrorState("Loading timeout reached. Please try refreshing the page.");
          setIsCheckingUserData(false);
        }}
        onRetry={onRetry}
      />
      
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
            setEmailSubmitted(true);
          }
          setShowEmailForm(show);
        }}
      />
      
      <UILogger />
      <TelegramDebugPanel />
    </>
  );
};
