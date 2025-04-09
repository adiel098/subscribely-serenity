
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
        
        // Since we might not have a users table yet, let's try to get user info from auth.users
        // This call will only succeed with correct permissions
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", project.owner_id)
            .single();
          
          if (!profileError && profile) {
            return profile;
          }
        } catch (profileError) {
          logger.error("Error fetching profile from profiles table:", profileError);
          // Continue to try auth.users as fallback
        }

        // Try to get from auth.users as fallback
        const { data: userData, error: userDataError } = await supabase.auth.admin.getUserById(
          project.owner_id
        );

        if (userDataError) {
          logger.error("Error fetching user data:", userDataError);
          return null;
        }

        return {
          first_name: userData.user?.user_metadata?.first_name || '',
          last_name: userData.user?.user_metadata?.last_name || ''
        };
      } catch (error) {
        logger.error("Exception fetching project owner:", error);
        return null;
      }
    },
    enabled: !!projectId
  });
};
