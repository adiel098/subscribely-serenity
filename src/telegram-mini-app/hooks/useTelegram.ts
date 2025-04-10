
import { useState, useEffect } from 'react';
import { createLogger } from "../utils/debugUtils";

const logger = createLogger("useTelegram");

interface TelegramHook {
  tg: TelegramWebApp | null;
  isTelegramAvailable: boolean;
}

export const useTelegram = (): TelegramHook => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isTelegramAvailable, setIsTelegramAvailable] = useState<boolean>(false);

  useEffect(() => {
    const initTelegram = () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const webApp = window.Telegram.WebApp;
          setTg(webApp);
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

// No need to redeclare the global Window interface here since it's already defined in vite-env.d.ts
