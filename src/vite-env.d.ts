
/// <reference types="vite/client" />

interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  };
  ready: () => void;
  expand: () => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
