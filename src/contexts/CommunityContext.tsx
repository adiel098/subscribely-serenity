
import { createContext, useContext, useState, useEffect } from "react";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useProjects } from "@/group_owners/hooks/useProjects";
import { useLocation, useNavigate } from "react-router-dom";
import { invokeSupabaseFunction } from "@/telegram-mini-app/services/utils/serviceUtils";
import { toast } from "sonner";

type CommunityContextType = {
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  isProjectSelected: boolean;
  selectedGroupId?: string | null;
  isGroupSelected?: boolean;
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
const SELECTED_PROJECT_KEY = 'selectedProjectId';

export const CommunityProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { data: allCommunities, isLoading: isCommunitiesLoading } = useCommunities();
  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const navigate = useNavigate();
  
  // Filter out communities that are not part of a group
  const communities = allCommunities?.filter(community => !community.is_group);
  
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(() => {
    // Check for saved community ID in localStorage
    const savedCommunityId = localStorage.getItem(SELECTED_COMMUNITY_KEY);
    return savedCommunityId;
  });
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    // Check for saved project ID in localStorage
    const savedProjectId = localStorage.getItem(SELECTED_PROJECT_KEY);
    return savedProjectId;
  });

  const location = useLocation();

  // Save the selected community ID to localStorage when it changes
  useEffect(() => {
    if (selectedCommunityId) {
      localStorage.setItem(SELECTED_COMMUNITY_KEY, selectedCommunityId);
      // When selecting a community, clear any selected project
      localStorage.removeItem(SELECTED_PROJECT_KEY);
      setSelectedProjectId(null);
    } else {
      localStorage.removeItem(SELECTED_COMMUNITY_KEY);
    }
  }, [selectedCommunityId]);

  // Save the selected project ID to localStorage when it changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem(SELECTED_PROJECT_KEY, selectedProjectId);
      // When selecting a project, clear any selected community
      localStorage.removeItem(SELECTED_COMMUNITY_KEY);
      setSelectedCommunityId(null);
    } else if (!selectedCommunityId && !selectedProjectId) {
      localStorage.removeItem(SELECTED_PROJECT_KEY);
    }
  }, [selectedProjectId, selectedCommunityId]);

  // Handle community selection and onboarding redirection
  useEffect(() => {
    const isDataLoaded = !isCommunitiesLoading && !isProjectsLoading;
    const hasCommunities = communities && communities.length > 0;
    const hasProjects = projects?.length > 0;
    
    if (!isDataLoaded) return;

    // If user has no communities and no projects, and they're trying to access the dashboard,
    // redirect them to the onboarding flow
    if (!hasCommunities && !hasProjects && location.pathname === '/dashboard') {
      console.log("No communities or projects found - redirecting to onboarding");
      // Don't redirect if they're already in the onboarding flow
      if (!location.pathname.startsWith('/onboarding')) {
        navigate('/onboarding', { replace: true });
        return;
      }
    }

    // If coming from Telegram connect page, select the latest community
    if (location.pathname === '/dashboard' && location.state?.from === '/connect/telegram') {
      if (hasCommunities) {
        if (communities.length > 0) {
          const latestCommunity = communities[0]; // Communities are ordered by created_at in descending order
          setSelectedCommunityId(latestCommunity.id);
          setSelectedProjectId(null);
        }
      }
      return;
    }
    
    // If nothing is selected but we have communities or projects, select one
    if (!selectedCommunityId && !selectedProjectId) {
      if (hasCommunities) {
        if (communities.length > 0) {
          setSelectedCommunityId(communities[0].id);
        }
      } else if (hasProjects) {
        setSelectedProjectId(projects[0].id);
      }
      return;
    }
    
    // If a community is selected but doesn't exist anymore, select another one
    if (selectedCommunityId && hasCommunities && !communities.find(c => c.id === selectedCommunityId)) {
      if (communities.length > 0) {
        setSelectedCommunityId(communities[0].id);
      } else {
        setSelectedCommunityId(null);
      }
      return;
    }
    
    // If a project is selected but doesn't exist anymore, select another one
    if (selectedProjectId && hasProjects && !projects.find(g => g.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
      return;
    }
  }, [communities, projects, selectedCommunityId, selectedProjectId, isCommunitiesLoading, isProjectsLoading, location, navigate]);

  useEffect(() => {
    // Synchronize community photos from Telegram on page load
    const refreshCommunityPhotos = async () => {
      if (!communities || communities.length === 0) return;
      
      try {
        console.log("Refreshing community photos on page load...");
        
        // Filter communities with Telegram chat IDs
        const telegramCommunities = communities.filter(c => c.id && c.telegram_chat_id);
        
        if (telegramCommunities.length === 0) {
          console.log("No communities with Telegram chat IDs found");
          return;
        }
        
        // Prepare community data for the bulk request
        const communitiesData = telegramCommunities.map(c => ({
          id: c.id,
          telegramChatId: c.telegram_chat_id
        }));
        
        // Call the Edge function
        const { data, error } = await invokeSupabaseFunction("check-community-photo", {
          communities: communitiesData,
          forceFetch: true
        });
        
        if (error) {
          console.error("Error refreshing community photos:", error);
          return;
        }
        
        // Log success
        console.log("Successfully refreshed all community photos:", data);
      } catch (err) {
        console.error("Failed to refresh community photos:", err);
      }
    };
    
    if (!isCommunitiesLoading && communities && communities.length > 0) {
      refreshCommunityPhotos();
    }
  }, [communities, isCommunitiesLoading]);

  return (
    <CommunityContext.Provider value={{
      selectedCommunityId,
      setSelectedCommunityId,
      selectedProjectId,
      setSelectedProjectId,
      isProjectSelected: !!selectedProjectId,
      selectedGroupId: null,
      isGroupSelected: false
    }}>
      {children}
    </CommunityContext.Provider>
  );
};
