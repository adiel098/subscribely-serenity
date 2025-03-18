
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Community } from "@/group_owners/hooks/useCommunities";
import { CommunityGroup } from "@/group_owners/hooks/types/communityGroup.types";

export const useGroupMembersEdit = (
  group: CommunityGroup,
  currentCommunities: Community[],
  onCommunitiesUpdated: () => void,
  onClose: () => void
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  
  // Initialize selected communities when component mounts
  useEffect(() => {
    if (currentCommunities.length > 0) {
      setSelectedCommunities(currentCommunities.map(c => c.id));
    } else {
      setSelectedCommunities([]);
    }
  }, [currentCommunities]); 
  
  // Toggle a community selection
  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };
  
  // Handle saving communities to group
  const handleSaveCommunities = async () => {
    try {
      console.log("Starting to save communities to group. Selection:", selectedCommunities);
      setIsSubmitting(true);
      
      // Get the current user ID to pass to the edge function
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to update communities");
        return;
      }
      
      console.log("Saving communities to group:", {
        groupId: group.id,
        communityIds: selectedCommunities,
        userId: user.id
      });
      
      // Use the edge function to handle the update
      // This uses community_id for the GROUP and member_id for the COMMUNITIES
      const response = await supabase.functions.invoke("add-communities-to-group", {
        body: {
          groupId: group.id,
          communityIds: selectedCommunities,
          userId: user.id
        }
      });
      
      if (response.error) {
        console.error("Error updating group communities:", response.error);
        toast.error("Failed to update communities");
        return;
      }
      
      console.log("Successfully updated communities:", response.data);
      toast.success("Group communities updated successfully");
      onCommunitiesUpdated();
      onClose();
    } catch (error) {
      console.error("Error in handleSaveCommunities:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    searchQuery,
    setSearchQuery,
    selectedCommunities,
    toggleCommunity,
    handleSaveCommunities
  };
};
