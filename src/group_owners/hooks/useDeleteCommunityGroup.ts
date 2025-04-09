
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteCommunityGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      console.log("Deleting project:", projectId);
      
      if (!projectId) {
        throw new Error("Project ID is required for deletion");
      }
      
      try {
        // First, unlink all communities from this project
        const { error: unlinkError } = await supabase
          .from("communities")
          .update({ project_id: null })
          .eq("project_id", projectId);
          
        if (unlinkError) {
          console.error("Error unlinking communities from project:", unlinkError);
          // Continue with deletion anyway
        }
        
        // Delete the project
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", projectId);
        
        if (error) {
          console.error("Error deleting project:", error);
          throw error;
        }
        
        return { id: projectId };
      } catch (error) {
        console.error("Error in deleteProject mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-communities"] });
      toast.success("Project deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  });
};
