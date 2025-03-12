
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateCommunityGroupData } from "./types/communityGroup.types";
import { toast } from "sonner";
import { useAuth } from "@/auth/contexts/AuthContext";

export const useCreateCommunityGroup = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCommunityGroupData) => {
      console.log("Creating new community group:", data);
      
      if (!user) {
        throw new Error("User is not authenticated");
      }
      
      try {
        // Insert into communities table with is_group flag set to true
        const { data: newGroup, error } = await supabase
          .from("communities")
          .insert({
            name: data.name,
            description: data.description || null,
            photo_url: data.photo_url || null,
            custom_link: data.custom_link || null,
            owner_id: user.id,
            is_group: true // Mark this as a group
          })
          .select("*")
          .single();
        
        if (error) {
          console.error("Error creating community group:", error);
          throw error;
        }
        
        if (!newGroup) {
          throw new Error("Failed to create community group");
        }
        
        console.log("Successfully created community group:", newGroup);
        
        // Insert community members if provided
        if (data.communities && data.communities.length > 0) {
          const groupMembers = data.communities.map((communityId, index) => ({
            community_id: newGroup.id,
            member_id: communityId,
            display_order: index,
            relationship_type: 'group'
          }));
          
          const { error: membersError } = await supabase
            .from("community_relationships")
            .insert(groupMembers);
          
          if (membersError) {
            console.error("Error adding communities to group:", membersError);
            // Don't throw here, we've already created the group
            toast.error("Warning: Some communities could not be added to the group");
          }
        }
        
        return newGroup;
      } catch (error) {
        console.error("Error in createCommunityGroup mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-groups"] });
      toast.success("Community group created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating community group:", error);
      
      let errorMessage = "Failed to create community group";
      
      if (error.code === "23505") {
        errorMessage = "A group with this custom link already exists";
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};
