
import { Route, Routes } from "react-router-dom";
import Index from "@/main/pages/Index";
import Auth from "@/auth/pages/Auth";
import NotFound from "@/main/pages/NotFound";
import TelegramMiniApp from "@/telegram-mini-app/pages/TelegramMiniApp";

export const PublicRoutes = () => {
  return (
    <>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
};
