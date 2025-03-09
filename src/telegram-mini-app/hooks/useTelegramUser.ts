
import { useEffect, useState } from 'react';

interface TelegramUser {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  /**
   * Returns true if the data was received from the Telegram Mini App,
   * false if it was manually provided
   */
  isFromTelegram: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
            photo_url?: string;
          };
          query_id?: string;
          start_param?: string;
        };
      };
    };
  }
}

export const useTelegramUser = (): TelegramUser | null => {
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // Try to get user from Telegram WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      console.log('[useTelegramUser] Found Telegram user:', telegramUser);
      
      setUser({
        id: telegramUser.id.toString(),
        username: telegramUser.username,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        photoUrl: telegramUser.photo_url,
        isFromTelegram: true
      });
    } else {
      console.log('[useTelegramUser] No Telegram user found in WebApp');
      
      // Try to get user from URL params as fallback
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('user_id');
      const username = urlParams.get('username');
      const firstName = urlParams.get('first_name');
      const lastName = urlParams.get('last_name');
      
      if (userId) {
        console.log('[useTelegramUser] Found user in URL params:', { userId, username, firstName, lastName });
        
        setUser({
          id: userId,
          username: username || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          isFromTelegram: false
        });
      } else {
        console.log('[useTelegramUser] No user found in URL params');
        setUser(null);
      }
    }
  }, []);

  return user;
};
