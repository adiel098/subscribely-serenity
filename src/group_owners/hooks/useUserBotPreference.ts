
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
        // בדיקה אם למשתמש יש פרויקט עם custom bot token
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('bot_token')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .maybeSingle();
        
        if (projectError) {
          console.error("Error fetching user bot preference:", projectError);
          throw projectError;
        }
        
        // קביעה אם משתמשים בבוט מותאם אישית לפי האם יש להם token
        const hasCustomBot = !!projectData?.bot_token;
        
        return {
          use_custom: hasCustomBot,
          custom_bot_token: projectData?.bot_token
        };
      } catch (error) {
        console.error("Error in bot preference query:", error);
        // ברירת מחדל לבוט הרשמי במקרה של שגיאה
        return {
          use_custom: false,
          custom_bot_token: null
        };
      }
    },
    enabled: !!user,
  });
  
  // ברירת מחדל לבוט הרשמי אם לא מוגדרות העדפות
  return {
    isCustomBot: data?.use_custom || false,
    hasCustomBotToken: !!data?.custom_bot_token,
    custom_bot_token: data?.custom_bot_token,
    isLoadingBotPreference: isLoading
  };
};
