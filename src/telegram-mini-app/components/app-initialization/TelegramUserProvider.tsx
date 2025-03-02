
import { useState, useEffect, ReactNode } from "react";

interface TelegramUserProviderProps {
  children: ReactNode;
  isDevelopmentMode: boolean;
}

export const TelegramUserProvider: React.FC<TelegramUserProviderProps> = ({
  children,
  isDevelopmentMode
}) => {
  // Get Telegram user ID directly from WebApp object using the method provided by the user
  const extractTelegramUserId = (): string | null => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
      // Ensure we're working with a string
      const userId = window.Telegram.WebApp.initDataUnsafe.user.id.toString().trim();
      console.log('🔑 Direct user ID extracted from WebApp:', userId);
      return userId;
    } else if (isDevelopmentMode) {
      const mockId = "12345678"; // Mock ID for development
      console.log('🔑 Using mock ID for development:', mockId);
      return mockId;
    }
    return null;
  };

  const telegramUserId = extractTelegramUserId();
  console.log('🔑 Final telegram user ID:', telegramUserId);

  return (
    <div data-telegram-user-id={telegramUserId}>
      {children}
    </div>
  );
};
