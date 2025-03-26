
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
      use_custom_bot: boolean;
      custom_bot_token?: string | null;
    } | null> => {
      if (!user) return null;
      
      // First try to get from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("use_custom_bot, custom_bot_token")
        .eq("id", user.id)
        .single();
      
      if (!profileError && profileData) {
        console.log("Found bot preference in profiles:", profileData);
        return profileData;
      }
      
      // If not in profiles, check if user has any communities with bot settings
      const { data: communityData, error: communityError } = await supabase
        .from("communities")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1)
        .single();
      
      if (!communityError && communityData) {
        const { data: botSettingsData, error: botSettingsError } = await supabase
          .from("telegram_bot_settings")
          .select("use_custom_bot, custom_bot_token")
          .eq("community_id", communityData.id)
          .single();
          
        if (!botSettingsError && botSettingsData) {
          console.log("Found bot preference in telegram_bot_settings:", botSettingsData);
          return botSettingsData;
        }
      }
      
      console.log("No bot preference found, using defaults");
      // Default to official bot if no preference is found
      return {
        use_custom_bot: false,
        custom_bot_token: null
      };
    },
    enabled: !!user,
  });
  
  // Default to official bot if no preference is set
  return {
    isCustomBot: data?.use_custom_bot || false,
    hasCustomBotToken: !!data?.custom_bot_token,
    custom_bot_token: data?.custom_bot_token,
    isLoadingBotPreference: isLoading
  };
};
