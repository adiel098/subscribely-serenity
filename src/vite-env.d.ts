
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
  version: string;
  platform: string;
  colorScheme: string;
  isExpanded: boolean;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
