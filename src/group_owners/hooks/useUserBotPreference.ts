
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";

interface UserBotPreference {
  isCustomBot: boolean;
  hasCustomBotToken: boolean;
  custom_bot_token?: string | null;
  isLoadingBotPreference: boolean;
}

export const useUserBotPreference = (): UserBotPreference => {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ["user-bot-preference", user?.id],
    queryFn: async (): Promise<{
      use_custom: boolean;
      custom_bot_token?: string | null;
    } | null> => {
      if (!user) return null;
      
      try {
        // Use the get_bot_preference database function
        const { data, error } = await supabase.rpc('get_bot_preference');
        
        if (error) {
          console.error("Error fetching bot preference:", error);
          throw error;
        }
        
        if (data) {
          console.log("Retrieved bot preference:", data);
          return data;
        }
        
        // Default to official bot if no preference is found
        return {
          use_custom: false,
          custom_bot_token: null
        };
      } catch (error) {
        console.error("Error in bot preference query:", error);
        // Default to official bot on error
        return {
          use_custom: false,
          custom_bot_token: null
        };
      }
    },
    enabled: !!user,
  });
  
  // Default to official bot if no preference is set
  return {
    isCustomBot: data?.use_custom || false,
    hasCustomBotToken: !!data?.custom_bot_token,
    custom_bot_token: data?.custom_bot_token,
    isLoadingBotPreference: isLoading
  };
};
