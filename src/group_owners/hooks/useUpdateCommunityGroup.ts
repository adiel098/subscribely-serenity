
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UpdateCommunityGroupData } from "./types/communityGroup.types";
import { toast } from "sonner";

export const useUpdateCommunityGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommunityGroupData) => {
      console.log("Updating community group:", data);
      
      if (!data.id) {
        throw new Error("Group ID is required for update");
      }
      
      try {
        // Update the community_groups table
        const updateData = {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.photo_url !== undefined && { photo_url: data.photo_url }),
          ...(data.custom_link !== undefined && { custom_link: data.custom_link })
        };
        
        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from("community_groups")
            .update(updateData)
            .eq("id", data.id);
          
          if (error) {
            console.error("Error updating community group:", error);
            throw error;
          }
        }
        
        // Update community members if provided
        if (data.communities) {
          // First, remove all existing members
          const { error: deleteError } = await supabase
            .from("community_group_members")
            .delete()
            .eq("group_id", data.id);
          
          if (deleteError) {
            console.error("Error removing existing group members:", deleteError);
            throw deleteError;
          }
          
          // Then add the new members
          if (data.communities.length > 0) {
            const groupMembers = data.communities.map((communityId, index) => ({
              group_id: data.id,
              community_id: communityId,
              display_order: index
            }));
            
            const { error: insertError } = await supabase
              .from("community_group_members")
              .insert(groupMembers);
            
            if (insertError) {
              console.error("Error adding communities to group:", insertError);
              throw insertError;
            }
          }
        }
        
        return { id: data.id };
      } catch (error) {
        console.error("Error in updateCommunityGroup mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-groups"] });
      queryClient.invalidateQueries({ queryKey: ["community-group-members"] });
      toast.success("Community group updated successfully!");
    },
    onError: (error: any) => {
      console.error("Error updating community group:", error);
      
      let errorMessage = "Failed to update community group";
      
      if (error.code === "23505") {
        errorMessage = "A group with this custom link already exists";
      }
      
      toast.error(errorMessage);
    }
  });
};
