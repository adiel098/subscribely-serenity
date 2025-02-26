import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCallback, useRef } from "react";

export interface BotSettings {
  id: string;
  community_id: string;
  welcome_message: string;
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
}

export const useBotSettings = (communityId: string) => {
  const queryClient = useQueryClient();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['bot-settings', communityId],
    queryFn: async () => {
      if (!communityId) return null;

      const { data, error } = await supabase
        .from('telegram_bot_settings')
        .select('*')
        .eq('community_id', communityId)
        .single();

      if (error) {
        console.error('Error fetching bot settings:', error);
        throw error;
      }

      return data as BotSettings;
    },
    enabled: Boolean(communityId),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<BotSettings>) => {
      if (!communityId) throw new Error('No community selected');

      const { data, error } = await supabase
        .from('telegram_bot_settings')
        .update(newSettings)
        .eq('community_id', communityId)
        .select()
        .single();

      if (error) {
        console.error('Error updating bot settings:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bot-settings', communityId] });
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
      key !== 'language'
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
