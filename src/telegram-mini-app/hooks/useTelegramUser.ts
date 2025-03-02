
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
        console.error('❌ FLOW: Missing telegramUserId parameter in useTelegramUser');
        console.error('❌ FLOW: telegramUserId type:', typeof telegramUserId);
        console.error('❌ FLOW: telegramUserId value:', telegramUserId);
        
        // Debug the ID extraction process
        if (window.Telegram) {
          console.log('🔍 DEBUG: window.Telegram exists');
          if (window.Telegram.WebApp) {
            console.log('🔍 DEBUG: window.Telegram.WebApp exists');
            console.log('🔍 DEBUG: WebApp properties:', Object.keys(window.Telegram.WebApp));
            if (window.Telegram.WebApp.initDataUnsafe) {
              console.log('🔍 DEBUG: initDataUnsafe exists');
              console.log('🔍 DEBUG: initDataUnsafe properties:', 
                          Object.keys(window.Telegram.WebApp.initDataUnsafe));
              if (window.Telegram.WebApp.initDataUnsafe.user) {
                console.log('🔍 DEBUG: user object exists');
                console.log('🔍 DEBUG: user properties:', 
                           Object.keys(window.Telegram.WebApp.initDataUnsafe.user));
                console.log('🔍 DEBUG: user.id:', window.Telegram.WebApp.initDataUnsafe.user.id);
              } else {
                console.log('❌ DEBUG: user object does not exist in initDataUnsafe');
              }
            } else {
              console.log('❌ DEBUG: initDataUnsafe does not exist');
            }
          } else {
            console.log('❌ DEBUG: window.Telegram.WebApp does not exist');
          }
        } else {
          console.log('❌ DEBUG: window.Telegram does not exist');
        }
        
        throw new Error('Missing Telegram user ID');
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
        
        // Extract user data from WebApp if available
        let firstName = '';
        let lastName = '';
        let username = '';
        let photoUrl = '';
        
        try {
          firstName = window.Telegram?.WebApp?.initDataUnsafe?.user?.first_name || '';
          lastName = window.Telegram?.WebApp?.initDataUnsafe?.user?.last_name || '';
          username = window.Telegram?.WebApp?.initDataUnsafe?.user?.username || '';
          photoUrl = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url || '';
          
          console.log('📝 FLOW: Extracted user details from WebApp:', {
            firstName, lastName, username, photoUrl
          });
        } catch (e) {
          console.warn('⚠️ Could not extract user details from WebApp:', e);
        }
        
        setUser({
          id: telegramUserId,
          first_name: firstName,
          last_name: lastName,
          username: username,
          photo_url: photoUrl,
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
