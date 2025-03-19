
import { createContext, useContext, useState, useEffect } from "react";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useCommunityGroups } from "@/group_owners/hooks/useCommunityGroups";
import { useLocation, useNavigate } from "react-router-dom";

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
  const { data: allCommunities, isLoading: isCommunitiesLoading } = useCommunities();
  const { data: groups, isLoading: isGroupsLoading } = useCommunityGroups();
  const navigate = useNavigate();
  
  const communities = allCommunities?.filter(community => !community.is_group);
  
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

  // Redirect to onboarding if no communities exist
  useEffect(() => {
    const isDataLoaded = !isCommunitiesLoading && !isGroupsLoading;
    const hasCommunities = communities && communities.length > 0;
    const hasGroups = groups?.length > 0;
    
    if (!isDataLoaded) return;

    // If user has no communities and no groups, and they're trying to access the dashboard,
    // redirect them to the onboarding flow
    if (!hasCommunities && !hasGroups && location.pathname === '/dashboard') {
      console.log("No communities or groups found - redirecting to onboarding");
      navigate('/onboarding', { replace: true });
      return;
    }

    // If coming from Telegram connect page, select the latest community
    if (location.pathname === '/dashboard' && location.state?.from === '/connect/telegram') {
      if (hasCommunities) {
        const regularCommunities = communities.filter(c => !c.is_group);
        if (regularCommunities.length > 0) {
          const latestCommunity = regularCommunities[0]; // Communities are ordered by created_at in descending order
          setSelectedCommunityId(latestCommunity.id);
          setSelectedGroupId(null);
        }
      }
      return;
    }
    
    // If nothing is selected but we have communities or groups, select one
    if (!selectedCommunityId && !selectedGroupId) {
      if (hasCommunities) {
        const regularCommunities = communities.filter(c => !c.is_group);
        if (regularCommunities.length > 0) {
          setSelectedCommunityId(regularCommunities[0].id);
        }
      } else if (hasGroups) {
        setSelectedGroupId(groups[0].id);
      }
      return;
    }
    
    // If a community is selected but doesn't exist anymore, select another one
    if (selectedCommunityId && hasCommunities && !communities.find(c => c.id === selectedCommunityId)) {
      const regularCommunities = communities.filter(c => !c.is_group);
      if (regularCommunities.length > 0) {
        setSelectedCommunityId(regularCommunities[0].id);
      } else {
        setSelectedCommunityId(null);
      }
      return;
    }
    
    // If a group is selected but doesn't exist anymore, select another one
    if (selectedGroupId && hasGroups && !groups.find(g => g.id === selectedGroupId)) {
      setSelectedGroupId(groups[0].id);
      return;
    }
  }, [communities, groups, selectedCommunityId, selectedGroupId, isCommunitiesLoading, isGroupsLoading, location, navigate]);

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
