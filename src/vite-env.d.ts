
/// <reference types="vite/client" />

interface TelegramWebApps {
  WebApp: {
    initDataUnsafe: {
      user?: {
        id: number;
        first_name?: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
    };
  };
}

interface Window {
  Telegram?: TelegramWebApps;
}
