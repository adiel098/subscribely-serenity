
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
        // Check if the user has any custom bot token set
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('custom_bot_token')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          console.error("Error fetching user bot preference:", userError);
          throw userError;
        }
        
        // Determine if using a custom bot based on whether they have a token
        const hasCustomBot = !!userData?.custom_bot_token;
        
        return {
          use_custom: hasCustomBot,
          custom_bot_token: userData?.custom_bot_token
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
