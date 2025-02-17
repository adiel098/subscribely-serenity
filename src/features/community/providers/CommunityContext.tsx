
import { createContext, useContext, useState, useEffect } from "react";
import { useCommunities } from "@/hooks/admin/useCommunities";
import { useLocation } from "react-router-dom";

type CommunityContextType = {
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
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

export const CommunityProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { data: communities, isLoading } = useCommunities();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(() => {
    const savedCommunityId = localStorage.getItem(SELECTED_COMMUNITY_KEY);
    return savedCommunityId;
  });
  const location = useLocation();

  useEffect(() => {
    if (selectedCommunityId) {
      localStorage.setItem(SELECTED_COMMUNITY_KEY, selectedCommunityId);
    } else {
      localStorage.removeItem(SELECTED_COMMUNITY_KEY);
    }
  }, [selectedCommunityId]);

  useEffect(() => {
    if (communities?.length && !isLoading) {
      if (location.pathname === '/dashboard' && location.state?.from === '/connect/telegram') {
        const latestCommunity = communities[0];
        setSelectedCommunityId(latestCommunity.id);
      }
      else if (!selectedCommunityId) {
        setSelectedCommunityId(communities[0].id);
      }
      else if (selectedCommunityId && !communities.find(c => c.id === selectedCommunityId)) {
        setSelectedCommunityId(communities[0].id);
      }
    }
  }, [communities, selectedCommunityId, isLoading, location]);

  return (
    <CommunityContext.Provider value={{
      selectedCommunityId,
      setSelectedCommunityId
    }}>
      {children}
    </CommunityContext.Provider>
  );
};
