import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Lazy load telegram mini app
const TelegramMiniApp = lazy(() => import("@/telegram-mini-app/pages/TelegramMiniApp"));

export const telegramRoutes: RouteObject[] = [
  {
    path: "/mini-app/*", 
    element: <TelegramMiniApp />
  }
];
