
import { createContext, useContext, useState, useEffect } from "react";
import { useCommunities } from "@/hooks/useCommunities";
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

export const CommunityProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { data: communities, isLoading } = useCommunities();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (communities?.length && !isLoading) {
      // אם מגיעים מדף ההתחברות של טלגרם, נבחר את הקהילה האחרונה שנוצרה
      if (location.pathname === '/dashboard' && location.state?.from === '/connect/telegram') {
        const latestCommunity = communities[0]; // הקהילות מסודרות לפי created_at בסדר יורד
        setSelectedCommunityId(latestCommunity.id);
      }
      // אם אין קהילה נבחרת, נבחר את הראשונה ברשימה
      else if (!selectedCommunityId) {
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
