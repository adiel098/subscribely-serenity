
/// <reference types="vite/client" />

interface TelegramWebApp {
  initDataUnsafe: {
    user?: {
      id?: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    start_param?: string;
  };
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  close?: () => void;
  ready?: () => void;
  expand?: () => void;
  isExpanded?: boolean;
}

interface Window {
  Telegram?: {
    WebApp?: TelegramWebApp;
  };
}
