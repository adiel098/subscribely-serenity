
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
      is_custom_bot: boolean;
      custom_bot_token?: string | null;
    } | null> => {
      if (!user) return null;
      
      // Fetch user bot preference from database
      const { data, error } = await supabase
        .from("user_settings")
        .select("is_custom_bot, custom_bot_token")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user bot preference:", error);
        return {
          is_custom_bot: false,
          custom_bot_token: null
        };
      }
      
      return data;
    },
    enabled: !!user,
  });
  
  // Default to official bot if no preference is set
  return {
    isCustomBot: data?.is_custom_bot || false,
    hasCustomBotToken: !!data?.custom_bot_token,
    custom_bot_token: data?.custom_bot_token,
    isLoadingBotPreference: isLoading
  };
};
