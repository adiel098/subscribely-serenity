
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjects");

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  bot_token?: string | null;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!user?.id) {
        logger.warn("No user ID available for fetching projects");
        return [];
      }
      
      logger.log("Fetching projects for user:", user.id);
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          logger.error("Error fetching projects:", error);
          throw error;
        }
        
        logger.log(`Fetched ${data?.length || 0} projects`);
        return data as Project[];
      } catch (error) {
        logger.error("Exception in projects fetch:", error);
        return [];
      }
    },
    enabled: !!user?.id
  });
};
