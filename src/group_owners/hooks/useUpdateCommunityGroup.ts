
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UpdateCommunityGroupData } from "./types/communityGroup.types";
import { toast } from "sonner";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useUpdateCommunityGroup");

export const useUpdateCommunityGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCommunityGroupData) => {
      logger.log("Updating community group:", data);
      
      if (!data.id) {
        throw new Error("Group ID is required for update");
      }
      
      try {
        // Update the communities table (groups are stored in communities with is_group=true)
        const updateData = {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.photo_url !== undefined && { telegram_photo_url: data.photo_url }),
          ...(data.custom_link !== undefined && { custom_link: data.custom_link })
        };
        
        if (Object.keys(updateData).length > 0) {
          // Check if custom_link already exists for another community
          if (data.custom_link) {
            const { data: existingCommunity, error: checkError } = await supabase
              .from("communities")
              .select("id")
              .eq("custom_link", data.custom_link)
              .neq("id", data.id)
              .maybeSingle();
              
            if (existingCommunity) {
              throw new Error("This custom link is already in use by another community or group");
            }
          }
          
          const { error } = await supabase
            .from("communities") 
            .update(updateData)
            .eq("id", data.id);
          
          if (error) {
            logger.error("Error updating community group:", error);
            throw error;
          }
        }
        
        // Update community members if provided (using community_relationships table)
        if (data.communities) {
          // First, remove all existing members
          const { error: deleteError } = await supabase
            .from("community_relationships")
            .delete()
            .eq("community_id", data.id)
            .eq("relationship_type", "group");
          
          if (deleteError) {
            logger.error("Error removing existing group members:", deleteError);
            throw deleteError;
          }
          
          // Then add the new members
          if (data.communities.length > 0) {
            const groupMembers = data.communities.map((communityId, index) => ({
              community_id: data.id,
              member_id: communityId,
              display_order: index,
              relationship_type: "group"
            }));
            
            const { error: insertError } = await supabase
              .from("community_relationships")
              .insert(groupMembers);
            
            if (insertError) {
              logger.error("Error adding communities to group:", insertError);
              throw insertError;
            }
          }
        }
        
        return { id: data.id };
      } catch (error) {
        logger.error("Error in updateCommunityGroup mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["community-groups"] });
      
      // Invalidate specific group members query to refresh channels
      queryClient.invalidateQueries({ 
        queryKey: ["community-group-members", data.id]
      });
      
      // Also invalidate the general community-group-members query to update all lists
      queryClient.invalidateQueries({ 
        queryKey: ["community-group-members"]
      });
      
      toast.success("Community group updated successfully!");
    },
    onError: (error: any) => {
      logger.error("Error updating community group:", error);
      
      let errorMessage = "Failed to update community group";
      
      if (error.code === "23505") {
        errorMessage = "A group with this custom link already exists";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};
