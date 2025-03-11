
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

export interface ReminderMessage {
  days_before: number;
  message: string;
  image: string | null;
}

export interface BotSettings {
  id: string;
  community_id: string | null;
  group_id: string | null;
  welcome_message: string;
  welcome_image: string | null;
  subscription_reminder_days: number;
  subscription_reminder_message: string;
  auto_remove_expired: boolean;
  expired_subscription_message: string;
  renewal_discount_enabled: boolean;
  renewal_discount_percentage: number;
  max_messages_per_day: number | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  auto_welcome_message: boolean;
  bot_signature: string;
  language: string;
  first_reminder_days: number;
  first_reminder_message: string;
  first_reminder_image: string | null;
  second_reminder_days: number;
  second_reminder_message: string;
  second_reminder_image: string | null;
}

export const useBotSettings = (communityId: string | null, groupId: string | null = null) => {
  const queryClient = useQueryClient();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['bot-settings', communityId, groupId],
    queryFn: async () => {
      if (!communityId && !groupId) return null;

      const query = supabase
        .from('telegram_bot_settings')
        .select('*');
      
      if (communityId) {
        query.eq('community_id', communityId);
      } else if (groupId) {
        query.eq('group_id', groupId);
      }

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching bot settings:', error);
        // If no settings found, create default settings
        if (error.code === 'PGRST116') {
          return createDefaultBotSettings(communityId, groupId);
        }
        throw error;
      }

      // Ensure all required properties have default values
      return {
        ...data,
        welcome_image: data.welcome_image || null,
        first_reminder_days: data.first_reminder_days || 3,
        first_reminder_message: data.first_reminder_message || 'Your subscription will expire soon. Renew now to maintain access!',
        first_reminder_image: data.first_reminder_image || null,
        second_reminder_days: data.second_reminder_days || 1,
        second_reminder_message: data.second_reminder_message || 'Final reminder: Your subscription expires tomorrow. Renew now to avoid losing access!',
        second_reminder_image: data.second_reminder_image || null
      } as BotSettings;
    },
    enabled: Boolean(communityId) || Boolean(groupId),
  });

  const createDefaultBotSettings = async (communityId: string | null, groupId: string | null) => {
    console.log("Creating default bot settings for", communityId ? `community ${communityId}` : `group ${groupId}`);
    
    const defaultSettings = {
      community_id: communityId,
      group_id: groupId,
      welcome_message: 'Welcome to our community! 👋\nWe\'re excited to have you here.\nFeel free to introduce yourself and join the conversations.',
      welcome_image: null,
      subscription_reminder_days: 3,
      subscription_reminder_message: 'Hey there! 🔔\nYour subscription will end soon. Don\'t forget to renew to keep enjoying our community!',
      auto_remove_expired: false,
      expired_subscription_message: 'Your subscription has ended. We hope to see you again soon! 🌟\nTo renew your subscription, please visit our subscription page.',
      renewal_discount_enabled: false,
      renewal_discount_percentage: 10,
      auto_welcome_message: true,
      bot_signature: '🤖 Community Bot',
      language: 'en',
      first_reminder_days: 3,
      first_reminder_message: 'Your subscription will expire soon. Renew now to maintain access!',
      first_reminder_image: null,
      second_reminder_days: 1,
      second_reminder_message: 'Final reminder: Your subscription expires tomorrow. Renew now to avoid losing access!',
      second_reminder_image: null,
    };

    try {
      const { data, error } = await supabase
        .from('telegram_bot_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) {
        console.error('Error creating default bot settings:', error);
        throw error;
      }

      return data as BotSettings;
    } catch (error) {
      console.error('Failed to create default bot settings:', error);
      return defaultSettings as BotSettings;
    }
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<BotSettings>) => {
      if (!communityId && !groupId) throw new Error('No community or group selected');

      const query = supabase
        .from('telegram_bot_settings')
        .update(newSettings);
      
      if (communityId) {
        query.eq('community_id', communityId);
      } else if (groupId) {
        query.eq('group_id', groupId);
      }

      const { data, error } = await query.select().single();

      if (error) {
        console.error('Error updating bot settings:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-settings', communityId, groupId] });
      toast.success('Bot settings updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating bot settings:', error);
      toast.error('Failed to update bot settings');
    },
  });

  const debouncedUpdateSettings = useCallback((newSettings: Partial<BotSettings>) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // For non-text fields (switches, numbers), update immediately
    if (!Object.keys(newSettings).some(key => 
      typeof newSettings[key as keyof BotSettings] === 'string' && 
      key !== 'language' && 
      key !== 'welcome_image' &&
      key !== 'first_reminder_image' &&
      key !== 'second_reminder_image'
    )) {
      updateSettingsMutation.mutate(newSettings);
      return;
    }

    // For text fields, debounce the update
    updateTimeoutRef.current = setTimeout(() => {
      updateSettingsMutation.mutate(newSettings);
    }, 1000); // Wait 1 second after last change before saving
  }, [updateSettingsMutation]);

  return {
    settings,
    isLoading,
    updateSettings: {
      mutate: debouncedUpdateSettings
    },
  };
};
