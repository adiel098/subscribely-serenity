
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BotSettings {
  id: string;
  owner_id: string;
  use_custom_bot: boolean;
  custom_bot_token?: string;
  created_at: string;
  updated_at: string;
}

export const useBotSettings = () => {
  return useQuery({
    queryKey: ["bot-settings"],
    queryFn: async (): Promise<BotSettings | null> => {
      const { data, error } = await supabase
        .from("bot_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching bot settings:", error);
        return null;
      }

      return data;
    }
  });
};
