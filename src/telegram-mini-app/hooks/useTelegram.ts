
import { useState, useEffect } from 'react';
import { createLogger } from "../utils/debugUtils";

const logger = createLogger("useTelegram");

interface TelegramWebApp {
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
  tg: TelegramWebApp | null;
  isTelegramAvailable: boolean;
  isDarkMode: boolean;
}

export const useTelegram = (): TelegramHook => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const initTelegram = () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp as TelegramWebApp;
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

// Add the Telegram WebApp types to the global Window interface
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}
