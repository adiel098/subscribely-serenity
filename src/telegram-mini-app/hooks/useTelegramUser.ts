
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
        
        // Try to get user from URL hash as fallback
        const hashUser = parseUserFromUrlHash();
        if (hashUser && hashUser.id) {
          console.log('[useTelegramUser] Found user in URL hash:', hashUser);
          
          setUser({
            id: hashUser.id.toString(),
            first_name: hashUser.first_name,
            last_name: hashUser.last_name,
            username: hashUser.username,
            photo_url: hashUser.photo_url,
          });
          
          setLoading(false);
          return;
        }
        
        // Try to get user from URL params as fallback
        const urlParams = new URLSearchParams(window.location.search);
        const paramUserId = urlParams.get('user_id') || userId;
        const username = urlParams.get('username');
        const firstName = urlParams.get('first_name');
        const lastName = urlParams.get('last_name');
        
        if (paramUserId) {
          console.log('[useTelegramUser] Found user in URL params or passed userId:', { paramUserId, username, firstName, lastName });
          
          setUser({
            id: paramUserId,
            username: username || undefined,
            first_name: firstName || undefined,
            last_name: lastName || undefined,
          });
        } else if (isDevelopment()) {
          // Use test data in development if no user found
          console.log('[useTelegramUser] Using mock user for development');
          setUser({
            id: '12345678',
            username: 'test_user',
            first_name: 'Test',
            last_name: 'User',
          });
        } else {
          console.log('[useTelegramUser] No user found in URL params');
          setError('No Telegram user information found');
          setUser(null);
        }
      } catch (err) {
        console.error('[useTelegramUser] Error fetching user:', err);
        setError(err instanceof Error ? err.message : 'Failed to get Telegram user data');
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
      console.log('[useTelegramUser] No Telegram user found in WebApp during refetch');
    }

    setLoading(false);
  };

  return { user, loading, error, refetch };
};
