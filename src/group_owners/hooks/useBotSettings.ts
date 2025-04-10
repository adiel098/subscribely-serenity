
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback, useRef } from "react";
import { BotSettings } from "./types/botSettings.types";

export const useBotSettings = (entityId: string | null) => {
  const queryClient = useQueryClient();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  console.log("useBotSettings hook initiated with entityId:", entityId);

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['bot-settings', entityId],
    queryFn: async () => {
      if (!entityId) {
        console.log("No entityId provided to useBotSettings");
        return null;
      }
      
      console.log(`Fetching bot settings for entity: ${entityId}`);

      const query = supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('project_id', entityId); // Changed from community_id to project_id

      const { data, error } = await query.single();

      if (error) {
        console.error('Error fetching bot settings:', error);
        if (error.code === 'PGRST116') {
          console.log(`No settings found for entity ${entityId}, creating defaults`);
          return createDefaultBotSettings(entityId);
        }
        throw error;
      }

      console.log(`Successfully fetched bot settings for entity ${entityId}:`, data);
      
      return {
        ...data,
        welcome_message: data.welcome_message || 'Welcome to our community! 👋\nWe\'re excited to have you here.',
        welcome_image: data.welcome_image || null,
        first_reminder_days: data.first_reminder_days || 3,
        first_reminder_message: data.first_reminder_message || 'Your subscription will expire soon. Renew now to maintain access!',
        first_reminder_image: data.first_reminder_image || null,
        second_reminder_days: data.second_reminder_days || 1,
        second_reminder_message: data.second_reminder_message || 'Final reminder: Your subscription expires tomorrow. Renew now to avoid losing access!',
        second_reminder_image: data.second_reminder_image || null,
        subscription_reminder_days: data.subscription_reminder_days || 3,
        language: data.language || 'en',
        renewal_discount_enabled: data.renewal_discount_enabled || false,
        renewal_discount_percentage: data.renewal_discount_percentage || 10
      } as BotSettings;
    },
    enabled: Boolean(entityId),
  });

  if (error) {
    console.error("Error in useBotSettings query:", error);
  }

  const createDefaultBotSettings = async (entityId: string | null) => {
    console.log("Creating default bot settings for entity", entityId);
    
    const defaultSettings = {
      project_id: entityId, // Changed from community_id to project_id
      welcome_message: 'Welcome to our community! 👋\nWe\'re excited to have you here.',
      welcome_image: null,
      subscription_reminder_days: 3,
      subscription_reminder_message: 'Hey there! 🔔\nYour subscription will end soon. Don\'t forget to renew!',
      expired_subscription_message: 'Your subscription has ended. We hope to see you again soon! 🌟',
      renewal_discount_enabled: false,
      renewal_discount_percentage: 10,
      language: 'en',
      first_reminder_days: 3,
      first_reminder_message: 'Your subscription will expire soon. Renew now to maintain access!',
      first_reminder_image: null,
      second_reminder_days: 1,
      second_reminder_message: 'Final reminder: Your subscription expires tomorrow. Renew now!',
      second_reminder_image: null
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

      console.log("Created default bot settings:", data);
      return data as BotSettings;
    } catch (error) {
      console.error('Failed to create default bot settings:', error);
      return defaultSettings as BotSettings;
    }
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<BotSettings>) => {
      if (!entityId) throw new Error('No entity selected');

      console.log(`Updating bot settings for entity ${entityId}:`, newSettings);

      const query = supabase
        .from('telegram_bot_settings')
        .update(newSettings)
        .eq('project_id', entityId); // Changed from community_id to project_id

      const { data, error } = await query.select().single();

      if (error) {
        console.error('Error updating bot settings:', error);
        throw error;
      }

      console.log(`Successfully updated bot settings for entity ${entityId}:`, data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-settings', entityId] });
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

export type { BotSettings };
