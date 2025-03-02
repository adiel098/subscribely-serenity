
import { useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { initTelegramWebApp } from "@/telegram-mini-app/utils/telegramUtils";

interface InitializationProviderProps {
  children: ReactNode;
  isDevelopmentMode: boolean;
  setIsDevelopmentMode: (isDev: boolean) => void;
  setTelegramInitialized: (isInitialized: boolean) => void;
  telegramInitialized: boolean;
  onRetry: () => void;
}

export const InitializationProvider: React.FC<InitializationProviderProps> = ({
  children,
  isDevelopmentMode,
  setIsDevelopmentMode,
  setTelegramInitialized,
  telegramInitialized,
  onRetry
}) => {
  useEffect(() => {
    // Force development mode on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setIsDevelopmentMode(true);
    }
  }, [setIsDevelopmentMode]);

  // Log Telegram WebApp object if available
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      console.log('📱 Telegram WebApp object is available');
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        console.log('👤 User from WebApp:', window.Telegram.WebApp.initDataUnsafe.user);
      }
    } else {
      console.log('❌ Telegram WebApp object is NOT available');
    }
  }, [telegramInitialized]);

  // Handle retry button click
  const handleTelegramInit = () => {
    const initialized = initTelegramWebApp();
    setTelegramInitialized(initialized);
  };

  return <>{children}</>;
};
