
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BotSettings } from './types/botSettings.types';

export type { BotSettings };

export const useBotSettings = (communityId: string | undefined) => {
  const [settings, setSettings] = useState<BotSettings>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['bot-settings', communityId],
    queryFn: async () => {
      if (!communityId) return null;
      
      const { data, error } = await supabase
        .from('bot_settings')
        .select('*')
        .eq('community_id', communityId)
        .single();
        
      if (error) {
        console.error('Error fetching bot settings:', error);
        throw error;
      }
      
      return data as BotSettings;
    },
    enabled: !!communityId
  });
  
  useEffect(() => {
    if (data) {
      setSettings(data);
    } else if (!isLoading && !error && communityId) {
      // If no settings exist yet, create default settings
      setSettings({
        community_id: communityId,
        welcome_message: 'Welcome to our community! Thank you for subscribing.',
        expired_subscription_message: 'Your subscription has expired. Please renew to keep access.',
        first_reminder_days: 3,
        first_reminder_message: 'Your subscription will expire soon. Renew now to maintain access!',
        second_reminder_days: 1,
        second_reminder_message: 'Final reminder: Your subscription expires tomorrow. Renew now to avoid losing access!',
        use_custom_bot: false,
      });
    }
  }, [data, isLoading, error, communityId]);
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<BotSettings>) => {
      if (!communityId) throw new Error('Community ID is required');
      
      const updatedSettings = { ...settings, ...newSettings };
      
      if (data) {
        // Update existing settings
        const { error } = await supabase
          .from('bot_settings')
          .update(updatedSettings)
          .eq('id', data.id);
          
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('bot_settings')
          .insert([{ ...updatedSettings, community_id: communityId }]);
          
        if (error) throw error;
      }
      
      return { ...settings, ...newSettings };
    },
    onSuccess: (newSettings) => {
      setSettings(newSettings);
      toast.success('Bot settings updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update bot settings');
      console.error('Error updating bot settings:', error);
    }
  });
  
  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsMutation
  };
};
