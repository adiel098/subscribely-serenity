
import { useState } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { LoadingIndicator } from "@/telegram-mini-app/components/app-content/LoadingIndicator";
import { UserDataChecker } from "@/telegram-mini-app/components/app-content/UserDataChecker";
import { ErrorNotifier } from "@/telegram-mini-app/components/app-content/ErrorNotifier";
import { AppContentRouter } from "@/telegram-mini-app/components/app-content/AppContentRouter";

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
  // All component state and functionality is now split into smaller components
  const isLoading = communityLoading || userLoading || isCheckingUserData;

  return (
    <>
      {/* Error notifications */}
      <ErrorNotifier errorState={errorState} />
      
      {/* User data checking logic */}
      <UserDataChecker
        telegramUser={telegramUser}
        userLoading={userLoading}
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
        showEmailForm={showEmailForm}
        onRetry={onRetry}
        setShowEmailForm={setShowEmailForm}
      />
    </>
  );
};
