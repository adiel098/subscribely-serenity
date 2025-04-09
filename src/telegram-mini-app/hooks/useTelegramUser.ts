
import { useEffect, useState, useCallback } from 'react';
import { TelegramUser, TelegramUserHookResult } from '../types/telegramTypes';
import { isDevelopment } from '../utils/telegram/environmentUtils';
import { getWebAppData } from '../utils/webAppDataExtractor';
import { TEST_USER } from '../utils/development/testData';
import { createLogger } from '../utils/debugUtils';

const logger = createLogger('useTelegramUser');

export const useTelegramUser = (communityId?: string, userId?: string): TelegramUserHookResult => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelegramUser = useCallback(async () => {
    logger.log('fetchTelegramUser called with communityId:', communityId, 'userId:', userId);
    setLoading(true);
    setError(null);
    
    try {
      // First try to extract user data directly from Telegram WebApp
      const telegramUser = getWebAppData(userId);
      
      if (telegramUser) {
        logger.log('User found from WebApp data:', telegramUser);
        setUser(telegramUser);
        setLoading(false);
        return;
      }
      
      logger.log('No Telegram user found in WebApp, checking URL params');
      
      // Check URL parameters for user data
      const urlParams = new URLSearchParams(window.location.search);
      const paramUserId = urlParams.get('user_id') || userId;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      if (paramUserId) {
        logger.log('Using user ID from URL parameters or props:', paramUserId);
        setUser({
          id: paramUserId,
          username: urlParams.get('username') || 'testuser',
          first_name: urlParams.get('first_name') || 'Test',
          last_name: urlParams.get('last_name') || 'User',
        });
      } else if (isLocalhost || isDevelopment()) {
        // Use demo user for development or localhost
        logger.log('Using TEST_USER for development environment');
        setUser(TEST_USER);
      } else {
        // No user data found and not in development mode
        throw new Error('No Telegram user found');
      }
    } catch (err) {
      logger.error('Error retrieving Telegram user:', err);
      setError(err instanceof Error ? err.message : 'Failed to get Telegram user');
    } finally {
      setLoading(false);
    }
  }, [communityId, userId]);

  useEffect(() => {
    fetchTelegramUser();
  }, [fetchTelegramUser]);

  const refetch = useCallback(() => {
    logger.log('Manually refetching user data');
    fetchTelegramUser();
  }, [fetchTelegramUser]);

  return { user, loading, error, refetch };
};
