
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteCommunityGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      console.log("Deleting community group:", groupId);
      
      if (!groupId) {
        throw new Error("Group ID is required for deletion");
      }
      
      try {
        // Delete the group (cascade will remove group members)
        const { error } = await supabase
          .from("community_groups")
          .delete()
          .eq("id", groupId);
        
        if (error) {
          console.error("Error deleting community group:", error);
          throw error;
        }
        
        return { id: groupId };
      } catch (error) {
        console.error("Error in deleteCommunityGroup mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-groups"] });
      queryClient.invalidateQueries({ queryKey: ["community-group-members"] });
      toast.success("Community group deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting community group:", error);
      toast.error("Failed to delete community group");
    }
  });
};
