
import { useState, useEffect } from 'react';
import { createLogger } from "../utils/debugUtils";

const logger = createLogger("useTelegram");

interface TelegramWebAppInterface {
  MainButton: any;
  BackButton: any;
  close: () => void;
  expand: () => void;
  ready: () => void;
  HapticFeedback?: any;
  initDataUnsafe?: any;
  isDarkMode?: boolean;
}

interface TelegramHook {
  tg: TelegramWebAppInterface | null;
  isTelegramAvailable: boolean;
  isDarkMode: boolean;
}

export const useTelegram = (): TelegramHook => {
  const [tg, setTg] = useState<TelegramWebAppInterface | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const initTelegram = () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          setTg(webApp);
          setIsTelegramAvailable(true);
          setIsDarkMode(!!webApp.isDarkMode);
          logger.log('Telegram WebApp initialized successfully');
        } else {
          logger.warn('Telegram WebApp not available in this context');
          setIsTelegramAvailable(false);
        }
      } catch (err) {
        logger.error('Error initializing Telegram WebApp:', err);
        setIsTelegramAvailable(false);
      }
    };

    initTelegram();
  }, []);

  return { tg, isTelegramAvailable, isDarkMode };
};

// Update the Telegram WebApp types to match our interface
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebAppInterface;
    };
  }
}
