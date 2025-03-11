
import { createContext, useContext, useState, useEffect } from "react";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroups } from "@/group_owners/hooks/useCommunityGroups";
import { useLocation } from "react-router-dom";

type CommunityContextType = {
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  isGroupSelected: boolean;
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const useCommunityContext = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunityContext must be used within a CommunityProvider');
  }
  return context;
};

const SELECTED_COMMUNITY_KEY = 'selectedCommunityId';
const SELECTED_GROUP_KEY = 'selectedGroupId';

export const CommunityProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { data: communities, isLoading: isCommunitiesLoading } = useCommunities();
  const { data: groups, isLoading: isGroupsLoading } = useCommunityGroups();
  
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(() => {
    // Check for saved community ID in localStorage
    const savedCommunityId = localStorage.getItem(SELECTED_COMMUNITY_KEY);
    return savedCommunityId;
  });
  
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(() => {
    // Check for saved group ID in localStorage
    const savedGroupId = localStorage.getItem(SELECTED_GROUP_KEY);
    return savedGroupId;
  });

  const location = useLocation();

  // Save the selected community ID to localStorage when it changes
  useEffect(() => {
    if (selectedCommunityId) {
      localStorage.setItem(SELECTED_COMMUNITY_KEY, selectedCommunityId);
      // When selecting a community, clear any selected group
      localStorage.removeItem(SELECTED_GROUP_KEY);
      setSelectedGroupId(null);
    } else {
      localStorage.removeItem(SELECTED_COMMUNITY_KEY);
    }
  }, [selectedCommunityId]);

  // Save the selected group ID to localStorage when it changes
  useEffect(() => {
    if (selectedGroupId) {
      localStorage.setItem(SELECTED_GROUP_KEY, selectedGroupId);
      // When selecting a group, clear any selected community
      localStorage.removeItem(SELECTED_COMMUNITY_KEY);
      setSelectedCommunityId(null);
    } else if (!selectedCommunityId && !selectedGroupId) {
      localStorage.removeItem(SELECTED_GROUP_KEY);
    }
  }, [selectedGroupId, selectedCommunityId]);

  useEffect(() => {
    const isDataLoaded = !isCommunitiesLoading && !isGroupsLoading;
    const hasCommunities = communities?.length > 0;
    const hasGroups = groups?.length > 0;
    
    if (!isDataLoaded) return;

    // If coming from Telegram connect page, select the latest community
    if (location.pathname === '/dashboard' && location.state?.from === '/connect/telegram') {
      if (hasCommunities) {
        const latestCommunity = communities[0]; // Communities are ordered by created_at in descending order
        setSelectedCommunityId(latestCommunity.id);
        setSelectedGroupId(null);
      }
      return;
    }
    
    // If nothing is selected but we have communities or groups, select one
    if (!selectedCommunityId && !selectedGroupId) {
      if (hasCommunities) {
        setSelectedCommunityId(communities[0].id);
      } else if (hasGroups) {
        setSelectedGroupId(groups[0].id);
      }
      return;
    }
    
    // If a community is selected but doesn't exist anymore, select another one
    if (selectedCommunityId && hasCommunities && !communities.find(c => c.id === selectedCommunityId)) {
      setSelectedCommunityId(communities[0].id);
      return;
    }
    
    // If a group is selected but doesn't exist anymore, select another one
    if (selectedGroupId && hasGroups && !groups.find(g => g.id === selectedGroupId)) {
      setSelectedGroupId(groups[0].id);
      return;
    }
  }, [communities, groups, selectedCommunityId, selectedGroupId, isCommunitiesLoading, isGroupsLoading, location]);

  return (
    <CommunityContext.Provider value={{
      selectedCommunityId,
      setSelectedCommunityId,
      selectedGroupId,
      setSelectedGroupId,
      isGroupSelected: !!selectedGroupId
    }}>
      {children}
    </CommunityContext.Provider>
  );
};
