
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useUpdateCommunityGroup");

export interface UpdateCommunityGroupData {
  id: string;
  name?: string;
  description?: string | null;
  photo_url?: string | null;
  custom_link?: string | null;
  communities?: string[];
  bot_token?: string | null;
}

export const useUpdateCommunityGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommunityGroupData) => {
      logger.log("Updating project:", data);
      
      if (!data.id) {
        throw new Error("Project ID is required for update");
      }
      
      try {
        // Update the projects table
        const updateData = {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.bot_token !== undefined && { bot_token: data.bot_token })
        };
        
        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from("projects") 
            .update(updateData)
            .eq("id", data.id);
          
          if (error) {
            logger.error("Error updating project:", error);
            throw error;
          }
        }
        
        // Update community associations if provided
        if (data.communities) {
          // First, remove all existing associations by setting project_id to null
          const { error: unlinkError } = await supabase
            .from("communities")
            .update({ project_id: null })
            .eq("project_id", data.id);
          
          if (unlinkError) {
            logger.error("Error removing existing project associations:", unlinkError);
            throw unlinkError;
          }
          
          // Then add the new associations if there are communities to add
          if (data.communities.length > 0) {
            // Update each community to associate it with this project
            const { error: linkError } = await supabase
              .from("communities")
              .update({ project_id: data.id })
              .in("id", data.communities);
            
            if (linkError) {
              logger.error("Error linking communities to project:", linkError);
              throw linkError;
            }
          }
        }
        
        return { id: data.id };
      } catch (error) {
        logger.error("Error in updateProject mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      
      // Invalidate specific project communities query to refresh channels
      queryClient.invalidateQueries({ 
        queryKey: ["project-communities", data.id]
      });
      
      // Also invalidate the general project-communities query to update all lists
      queryClient.invalidateQueries({ 
        queryKey: ["project-communities"]
      });
      
      toast.success("Project updated successfully!");
    },
    onError: (error: any) => {
      logger.error("Error updating project:", error);
      
      let errorMessage = "Failed to update project";
      
      if (error.code === "23505") {
        errorMessage = "A project with this name already exists";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};
