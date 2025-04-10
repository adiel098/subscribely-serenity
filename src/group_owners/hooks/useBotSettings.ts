
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { BotSettings } from './types/subscription.types';
import { useState } from 'react';

export const useBotSettings = (projectId?: string) => {
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['bot-settings', projectId],
    queryFn: async () => {
      try {
        if (!projectId) return defaultBotSettings;
        
        const { data, error } = await supabase
          .from('bot_settings')
          .select('*')
          .eq('project_id', projectId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // If no record exists, create default settings
            const defaultSettings = {
              ...defaultBotSettings,
              project_id: projectId
            };
            
            const { data: newData, error: createError } = await supabase
              .from('bot_settings')
              .insert(defaultSettings)
              .select()
              .single();
              
            if (createError) throw createError;
            return newData;
          }
          throw error;
        }

        return data;
      } catch (err: any) {
        setError(err);
        return defaultBotSettings;
      }
    },
    enabled: !!projectId
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<BotSettings>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      try {
        const { data, error } = await supabase
          .from('bot_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('project_id', projectId)
          .select();

        if (error) throw error;
        return data;
      } catch (err: any) {
        setError(err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['bot-settings', projectId]
      });
    }
  });

  return {
    settings: settings || defaultBotSettings,
    isLoading,
    error,
    updateSettings: {
      mutate: updateSettings.mutate,
      isLoading: updateSettings.isPending
    }
  };
};

const defaultBotSettings: BotSettings = {
  welcome_message: "👋 Welcome to our community! Your subscription is now active.",
  expired_message: "Your subscription has expired. Please renew to continue accessing our content.",
  removed_message: "You have been removed from the group due to an expired subscription.",
  reminder_message: "Your subscription will expire soon. Please renew to maintain access.",
  auto_remove_expired: false,
  auto_remove_days: 3,
  send_reminders: true,
  reminder_days: 3,
  project_id: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
