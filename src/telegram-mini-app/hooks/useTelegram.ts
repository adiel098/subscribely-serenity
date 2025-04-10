
import { useState, useEffect } from 'react';
import { createLogger } from "../utils/debugUtils";

const logger = createLogger("useTelegram");

// Make sure our interface matches what's actually available in the Telegram WebApp
interface TelegramWebAppInterface {
  MainButton?: any;
  BackButton?: any;
  close?: () => void;
  expand?: () => void;
  ready?: () => void;
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
          // Cast to TelegramWebAppInterface to match our expected interface
          setTg(webApp as unknown as TelegramWebAppInterface);
          setIsTelegramAvailable(true);
          // Safely check for isDarkMode property
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

// Update the global declaration to match what we expect
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebAppInterface;
    };
  }
}
