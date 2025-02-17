
import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Community = {
  id: string;
  name: string;
  created_at: string;
}

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
  const { data: communities, isLoading, refetch } = useQuery({
    queryKey: ['communities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Community[];
    }
  });

  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(() => {
    return localStorage.getItem(SELECTED_COMMUNITY_KEY);
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
