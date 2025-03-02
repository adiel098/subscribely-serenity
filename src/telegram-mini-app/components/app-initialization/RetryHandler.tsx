
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { initTelegramWebApp } from "@/telegram-mini-app/utils/telegramUtils";

interface RetryHandlerProps {
  communityLoading: boolean;
  userLoading: boolean;
  retryCount: number;
  setRetryCount: (count: number) => void;
  setErrorState: (error: string | null) => void;
  setIsCheckingUserData: (isChecking: boolean) => void;
  refetchUser: () => void;
  setTelegramInitialized: (isInitialized: boolean) => void;
}

export const RetryHandler: React.FC<RetryHandlerProps> = ({
  communityLoading,
  userLoading,
  retryCount,
  setRetryCount,
  setErrorState,
  setIsCheckingUserData,
  refetchUser,
  setTelegramInitialized
}) => {
  const { toast } = useToast();
  
  // Auto retry once if loading takes too long
  useEffect(() => {
    let timeout: number | null = null;
    
    // If we're in loading state for more than 10 seconds and retry count is 0, auto retry
    if ((communityLoading || userLoading) && retryCount === 0) {
      timeout = window.setTimeout(() => {
        console.log('🔄 Auto retrying due to long loading time');
        handleRetry();
      }, 10000);
    }
    
    return () => {
      if (timeout) window.clearTimeout(timeout);
    };
  }, [communityLoading, userLoading, retryCount]);

  // Handle retry button click
  const handleRetry = () => {
    console.log('🔄 Retrying user data fetch');
    setErrorState(null);
    setIsCheckingUserData(true);
    // Fix: Use a direct number value instead of a function
    setRetryCount(retryCount + 1);
    refetchUser();
    
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
    
    toast({
      title: "Retrying",
      description: "Attempting to reconnect to Telegram...",
    });
  };

  return null; // Non-visual component
};
