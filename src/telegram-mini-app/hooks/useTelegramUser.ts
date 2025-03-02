
/**
 * Hook to fetch Telegram user data from the database
 * Clearly differentiates between "user not found" and "user exists without email"
 */
import { useState, useEffect } from 'react';
import { fetchTelegramUserById } from '@/telegram-mini-app/services/telegramUserService';
import { TelegramUser } from '@/telegram-mini-app/types/telegramTypes';

export const useTelegramUser = (startParam: string, telegramUserId: string | null) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userExistsInDatabase, setUserExistsInDatabase] = useState<boolean | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!telegramUserId) {
        console.error('❌ FLOW: Missing telegramUserId parameter');
        throw new Error('Missing Telegram user ID');
      }
      
      // Validate telegramUserId format
      if (!/^\d+$/.test(telegramUserId)) {
        console.error('❌ FLOW: Invalid Telegram ID format:', telegramUserId);
        throw new Error('Invalid Telegram user ID format');
      }
      
      console.log('🔍 FLOW: Checking database for user with ID:', telegramUserId);
      
      // Fetch user data from the database
      const userData = await fetchTelegramUserById(telegramUserId);
      console.log('📱 FLOW: Telegram user data fetched:', userData);
      
      if (userData) {
        // User exists in database
        setUser(userData);
        setUserExistsInDatabase(true);
        console.log('✅ FLOW: User found in database with ID:', telegramUserId);
      } else {
        // User does not exist in database - create temporary object for the flow
        console.log('🆕 FLOW: User not found in database with ID:', telegramUserId);
        setUserExistsInDatabase(false);
        setUser({
          id: telegramUserId,
          // Set from WebApp object if available
          first_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || '',
          last_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name || '',
          username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '',
          photo_url: window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || '',
          email: null
        });
      }
    } catch (err) {
      console.error('❌ FLOW: Error fetching Telegram user:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (telegramUserId) {
      console.log('🔄 FLOW: Initiating user data fetch for ID:', telegramUserId);
      fetchUser();
    } else {
      console.warn('⚠️ FLOW: No telegramUserId provided, skipping fetch');
      setLoading(false);
    }
  }, [telegramUserId, startParam]);

  const refetch = () => {
    if (telegramUserId) {
      console.log('🔄 FLOW: Refetching user data for ID:', telegramUserId);
      fetchUser();
    } else {
      console.warn('⚠️ FLOW: Cannot refetch - no telegramUserId provided');
    }
  };

  return { user, loading, error, refetch, userExistsInDatabase };
};
