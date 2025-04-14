import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import logger from '@/utils/logger';

export interface TelegramBotConfig {
  id: string;
  project_id: string;
  bot_token: string;
  bot_username: string;
  webhook_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch Telegram bot configuration for a project
 * @param projectId - The ID of the project
 */
export const useTelegramBot = (projectId: string | null) => {
  const [error, setError] = useState<string | null>(null);

  const fetchTelegramBot = async (): Promise<TelegramBotConfig | null> => {
    if (!projectId) return null;

    try {
      const { data, error: fetchError } = await supabase
        .from('telegram_bot_configs')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No records found - this is not an error for our use case
          return null;
        }
        throw new Error(fetchError.message);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Telegram bot configuration';
      logger.error('Error fetching Telegram bot configuration:', errorMessage);
      setError(errorMessage);
      throw err;
    }
  };

  const { 
    data: botConfig, 
    isLoading, 
    refetch 
  } = useQuery<TelegramBotConfig | null>({
    queryKey: ['telegramBot', projectId],
    queryFn: fetchTelegramBot,
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    botConfig,
    isLoading,
    error,
    refetch
  };
};
