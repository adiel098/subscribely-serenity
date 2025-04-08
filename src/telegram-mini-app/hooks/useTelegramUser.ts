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
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (paramUserId || isLocalhost) {
          // אם יש לנו ID מה-URL או שאנחנו בלוקאלהוסט, נשתמש במשתמש טסט
          console.log('[useTelegramUser] Using test user data');
          setUser({
            id: paramUserId || '123456789',
            username: urlParams.get('username') || 'testuser',
            first_name: urlParams.get('first_name') || 'Test',
            last_name: urlParams.get('last_name') || 'User',
          });
        } else {
          // אם אנחנו לא בלוקאלהוסט ואין לנו משתמש מהטלגרם, נחזיר שגיאה
          throw new Error('No Telegram user found');
        }

      } catch (err) {
        console.error('[useTelegramUser] Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to get Telegram user');
      } finally {
        setLoading(false);
      }
    };

    fetchTelegramUser();
  }, [communityId, userId]);

  return { user, loading, error };
};
