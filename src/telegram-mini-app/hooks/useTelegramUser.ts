
/**
 * Adjust this hook to only fetch user data without creating a user record
 * This ensures that user creation only happens in the email collection form
 */
import { useState, useEffect } from 'react';
import { fetchTelegramUserById } from '@/telegram-mini-app/services/telegramUserService';
import { TelegramUser } from '@/telegram-mini-app/types/telegramTypes';

export const useTelegramUser = (startParam: string, telegramUserId: string | null) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!telegramUserId) {
        console.error('❌ useTelegramUser: Missing telegramUserId parameter');
        throw new Error('Missing Telegram user ID');
      }
      
      // Validate telegramUserId format
      if (!/^\d+$/.test(telegramUserId)) {
        console.error('❌ useTelegramUser: Invalid Telegram ID format:', telegramUserId);
        throw new Error('Invalid Telegram user ID format');
      }
      
      // Only fetch the user data, don't create a user record
      const userData = await fetchTelegramUserById(telegramUserId);
      console.log('📱 Telegram user data fetched:', userData);
      
      if (userData) {
        setUser(userData);
      } else {
        // If no user data is found in the database, still provide an object with the ID
        // This allows the app to show the email collection form without a database record
        console.log('📱 No user record found, creating temporary user object with ID:', telegramUserId);
        setUser({
          id: telegramUserId,
          // Set from WebApp object if available
          first_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || '',
          last_name: window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name || '',
          username: window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '',
          photo_url: window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || '',
          // The email will definitely be empty, forcing the email collection form
          email: null
        });
      }
    } catch (err) {
      console.error('❌ Error fetching Telegram user:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (telegramUserId) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [telegramUserId, startParam]);

  const refetch = () => {
    if (telegramUserId) {
      fetchUser();
    }
  };

  return { user, loading, error, refetch };
};
