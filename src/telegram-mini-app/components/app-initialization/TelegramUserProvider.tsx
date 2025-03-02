
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
    try {
      // Using the exact format suggested by the user
      const telegramUserId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();
      
      if (telegramUserId) {
        console.log('🔑 Direct user ID extracted from WebApp:', telegramUserId);
        return telegramUserId;
      } else if (isDevelopmentMode) {
        const mockId = "12345678"; // Mock ID for development
        console.log('🔑 Using mock ID for development:', mockId);
        return mockId;
      }
    } catch (err) {
      console.error('❌ Error extracting Telegram user ID:', err);
      if (isDevelopmentMode) {
        return "12345678"; // Fallback to mock ID in development
      }
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
