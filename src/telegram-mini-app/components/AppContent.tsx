
import { useState, useEffect } from "react";
import { TelegramUser } from "@/telegram-mini-app/types/telegramTypes";
import { Community } from "@/telegram-mini-app/types/community.types";
import { LoadingIndicator } from "@/telegram-mini-app/components/app-content/LoadingIndicator";
import { UserDataChecker } from "@/telegram-mini-app/components/app-content/UserDataChecker";
import { ErrorNotifier } from "@/telegram-mini-app/components/app-content/ErrorNotifier";
import { AppContentRouter } from "@/telegram-mini-app/components/app-content/AppContentRouter";
import { AnimatePresence, motion } from "framer-motion";

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
  // Track when email form is completed
  const [emailFormCompleted, setEmailFormCompleted] = useState(false);
  
  // All component state and functionality is now split into smaller components
  const isLoading = communityLoading || userLoading || isCheckingUserData;
  
  // Effect to refetch user data after email form is completed
  useEffect(() => {
    if (emailFormCompleted) {
      console.log("📧 Email form completed, refetching user data");
      onRefetch();
      setEmailFormCompleted(false);
    }
  }, [emailFormCompleted, onRefetch]);

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
      
      {/* Main routing logic with smooth transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${isLoading}-${errorState}-${showEmailForm}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AppContentRouter
            loading={isLoading}
            errorState={errorState}
            telegramUserId={telegramUserId}
            community={community}
            telegramUser={telegramUser}
            showEmailForm={showEmailForm}
            isCheckingUserData={isCheckingUserData}
            onRetry={onRetry}
            setShowEmailForm={(show) => {
              if (showEmailForm && !show) {
                // Email form is being closed - mark as completed to trigger refetch
                setEmailFormCompleted(true);
              }
              setShowEmailForm(show);
            }}
          />
        </motion.div>
      </AnimatePresence>
    </>
  );
};
