
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjectOwnerInfo");

export const useProjectOwnerInfo = (projectId: string | null) => {
  return useQuery({
    queryKey: ["projectOwner", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      try {
        const { data: project, error } = await supabase
          .from("projects")
          .select("owner_id")
          .eq("id", projectId)
          .single();
        
        if (error || !project) {
          logger.error("Error fetching project owner:", error);
          return null;
        }
        
        // Use the users table instead of profiles
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("first_name, last_name")
          .eq("id", project.owner_id)
          .single();
        
        if (profileError) {
          logger.error("Error fetching profile from users table:", profileError);
          return {
            first_name: '',
            last_name: ''
          };
        }
        
        return profile;
      } catch (error) {
        logger.error("Exception fetching project owner:", error);
        return null;
      }
    },
    enabled: !!projectId
  });
};
