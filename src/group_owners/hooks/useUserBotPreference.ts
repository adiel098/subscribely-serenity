
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BotPreference {
  use_custom_bot: boolean;
  custom_bot_token: string | null;
}

export const useUserBotPreference = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-bot-preference'],
    queryFn: async (): Promise<BotPreference> => {
      try {
        const { data, error } = await supabase.rpc('get_bot_preference');
        
        if (error) {
          console.error('Error fetching bot preference:', error);
          // Default to official bot if there's an error
          return { use_custom_bot: false, custom_bot_token: null };
        }
        
        return {
          use_custom_bot: data.use_custom_bot || false,
          custom_bot_token: data.custom_bot_token || null
        };
      } catch (error) {
        console.error('Failed to fetch bot preference:', error);
        // Default to official bot if there's an error
        return { use_custom_bot: false, custom_bot_token: null };
      }
    },
  });

  return {
    botPreference: data,
    isCustomBot: data?.use_custom_bot || false,
    hasCustomBotToken: Boolean(data?.custom_bot_token),
    isLoadingBotPreference: isLoading,
    botPreferenceError: error,
  };
};
