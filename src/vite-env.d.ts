
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
  initData?: string;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    isVisible: boolean;
  };
  HapticFeedback?: {
    impactOccurred: (style: string) => void;
    notificationOccurred: (type: string) => void;
    selectionChanged: () => void;
  };
  setViewport?: () => void;
  expand?: () => void;
  ready?: () => void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
