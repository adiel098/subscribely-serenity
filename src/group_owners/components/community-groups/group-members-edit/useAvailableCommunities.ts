
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { Community } from "@/group_owners/hooks/useCommunities";

export const useAvailableCommunities = (
  searchQuery: string,
  currentCommunities: Community[]
) => {
  // Get all available communities
  const { data: allCommunities, isLoading: isLoadingCommunities } = useCommunities();
  
  // Filter out communities that are already in the group and match search query
  const availableCommunities = allCommunities?.filter(community => 
    !currentCommunities.some(c => c.id === community.id) && 
    !community.is_group &&
    (searchQuery.trim() === "" || 
     community.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  return {
    availableCommunities,
    isLoadingCommunities
  };
};
