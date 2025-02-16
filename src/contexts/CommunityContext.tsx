
import { createContext, useContext, useState, useEffect } from "react";
import { useCommunities } from "@/hooks/useCommunities";

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

export const CommunityProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { data: communities } = useCommunities();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  useEffect(() => {
    if (communities?.length && !selectedCommunityId) {
      setSelectedCommunityId(communities[0].id);
    }
  }, [communities, selectedCommunityId]);

  return (
    <CommunityContext.Provider value={{
      selectedCommunityId,
      setSelectedCommunityId
    }}>
      {children}
    </CommunityContext.Provider>
  );
};
