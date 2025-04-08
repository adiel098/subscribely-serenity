import { useEffect, useState } from 'react';
import { TelegramUser, TelegramUserHookResult } from '../types/telegramTypes';
import { parseUserFromUrlHash } from '../utils/telegram/environmentUtils';
import { isDevelopment } from '../utils/telegram/environmentUtils';

export const useTelegramUser = (communityId?: string, userId?: string): TelegramUserHookResult => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTelegramUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to get user from Telegram WebApp
        if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
          const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
          console.log('[useTelegramUser] Found Telegram user:', telegramUser);
          
          setUser({
            id: telegramUser.id.toString(),
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            photo_url: telegramUser.photo_url,
          });
          
          setLoading(false);
          return;
        }
        
        console.log('[useTelegramUser] No Telegram user found in WebApp');
        
        // בדיקה אם אנחנו במצב פיתוח או שיש לנו משתמש מה-URL
        const urlParams = new URLSearchParams(window.location.search);
        const paramUserId = urlParams.get('user_id') || userId;

        if (paramUserId) {
          // אם יש לנו ID מה-URL, נשתמש בו
          console.log('[useTelegramUser] Using user ID from URL:', paramUserId);
          setUser({
            id: paramUserId,
            username: urlParams.get('username') || 'user',
            first_name: urlParams.get('first_name') || 'Test',
            last_name: urlParams.get('last_name') || 'User',
          });
        } else {
          // אם אין משתמש מהטלגרם ואין ID מה-URL, נשתמש במשתמש טסט
          console.log('[useTelegramUser] Using test user');
          setUser({
            id: '123456789',
            username: 'test_user',
            first_name: 'Test',
            last_name: 'User',
            photo_url: 'https://via.placeholder.com/100'
          });
          setError('No Telegram user found, using test user (ID: 123456789)');
        }
      } catch (err) {
        console.error('[useTelegramUser] Error fetching user:', err);
        setError(err instanceof Error ? err.message : 'Failed to get Telegram user data');
        // גם במקרה של שגיאה, נשתמש במשתמש טסט
        setUser({
          id: '123456789',
          username: 'test_user',
          first_name: 'Test',
          last_name: 'User',
          photo_url: 'https://via.placeholder.com/100'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTelegramUser();
  }, [userId, communityId]);

  const refetch = () => {
    console.log('[useTelegramUser] Refetching user data');
    setLoading(true);
    setError(null);

    // Try to get user from Telegram WebApp again
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUser({
        id: telegramUser.id.toString(),
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
      });
    } else {
      // אם אין משתמש מהטלגרם, נשתמש במשתמש טסט
      setUser({
        id: '123456789',
        username: 'test_user',
        first_name: 'Test',
        last_name: 'User',
        photo_url: 'https://via.placeholder.com/100'
      });
      console.log('[useTelegramUser] No Telegram user found in WebApp during refetch, using test user');
    }

    setLoading(false);
  };

  return { user, loading, error, refetch };
};
