
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
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  close?: () => void;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
