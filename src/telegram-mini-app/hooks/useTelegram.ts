
import { useState, useEffect } from 'react';
import { createLogger } from "../utils/debugUtils";

const logger = createLogger("useTelegram");

// Define interface for Telegram WebApp based on the available window.Telegram.WebApp properties
interface TelegramWebAppInterface {
  MainButton?: any;
  BackButton?: any;
  close?: () => void;
  expand?: () => void;
  ready?: () => void;
  HapticFeedback?: any;
  initDataUnsafe?: any;
}

interface TelegramHook {
  tg: TelegramWebAppInterface | null;
  isTelegramAvailable: boolean;
}

export const useTelegram = (): TelegramHook => {
  const [tg, setTg] = useState<TelegramWebAppInterface | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState<boolean>(false);

  useEffect(() => {
    const initTelegram = () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          // Cast to TelegramWebAppInterface to match our expected interface
          setTg(webApp as unknown as TelegramWebAppInterface);
          setIsTelegramAvailable(true);
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

  return { tg, isTelegramAvailable };
};

// Make sure the global declaration matches our expected interface
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebAppInterface;
    };
  }
}
