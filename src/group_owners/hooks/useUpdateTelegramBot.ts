import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { TelegramBotConfig } from './useTelegramBot';
import logger from '@/utils/logger';

interface UpdateBotParams {
  projectId: string;
  botData: Partial<TelegramBotConfig>;
}

/**
 * Hook to update or create a Telegram bot configuration
 */
export const useUpdateTelegramBot = () => {
  const queryClient = useQueryClient();

  const updateTelegramBot = async ({ projectId, botData }: UpdateBotParams): Promise<TelegramBotConfig> => {
    try {
      // Check if a config exists for this project
      const { data: existingConfig, error: checkError } = await supabase
        .from('telegram_bot_configs')
        .select('id')
        .eq('project_id', projectId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw new Error(checkError.message);
      }

      let result;

      if (existingConfig) {
        // Update existing config
        const { data: updatedData, error: updateError } = await supabase
          .from('telegram_bot_configs')
          .update({
            ...botData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConfig.id)
          .select('*')
          .single();

        if (updateError) throw new Error(updateError.message);
        result = updatedData;
      } else {
        // Create new config
        const { data: newData, error: insertError } = await supabase
          .from('telegram_bot_configs')
          .insert({
            project_id: projectId,
            ...botData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('*')
          .single();

        if (insertError) throw new Error(insertError.message);
        result = newData;
      }

      return result;
    } catch (err) {
      logger.error('Error updating Telegram bot:', err);
      throw err;
    }
  };

  const mutation = useMutation<
    TelegramBotConfig,
    Error,
    UpdateBotParams
  >({
    mutationFn: updateTelegramBot,
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['telegramBot', variables.projectId] });
    }
  });

  return {
    updateBot: mutation.mutate,
    updateBotAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
    status: mutation.status
  };
};
