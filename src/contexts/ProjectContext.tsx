import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useCommunities } from "@/group_owners/hooks/useCommunities";
import { useProjects } from "@/group_owners/hooks/useProjects";
import { useLocation, useNavigate } from "react-router-dom";
import { invokeSupabaseFunction } from "@/telegram-mini-app/services/utils/serviceUtils";
import { toast } from "sonner";

type ProjectContextType = {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedCommunityId: string | null;  // שמרנו לאחורה למקרה שעדיין יש שימוש
  setSelectedCommunityId: (id: string | null) => void;
  isProjectSelected: boolean;
  selectedGroupId?: string | null;
  isGroupSelected?: boolean;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  try {
    const context = useContext(ProjectContext);
    
    // Validate context exists
    if (!context) {
      console.error('useProjectContext must be used within a ProjectProvider');
      // Return a safe default context instead of throwing
      return {
        selectedProjectId: null,
        setSelectedProjectId: () => {},
        selectedCommunityId: null,
        setSelectedCommunityId: () => {},
        isProjectSelected: false,
        selectedGroupId: null,
        isGroupSelected: false
      };
    }
    
    return context;
  } catch (error) {
    console.error('Error in useProjectContext:', error);
    // Return a safe default context in case of any error
    return {
      selectedProjectId: null,
      setSelectedProjectId: () => {},
      selectedCommunityId: null,
      setSelectedCommunityId: () => {},
      isProjectSelected: false,
      selectedGroupId: null,
      isGroupSelected: false
    };
  }
};

const SELECTED_PROJECT_KEY = 'selectedProjectId';
const SELECTED_COMMUNITY_KEY = 'selectedCommunityId';

export const ProjectProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { data: allCommunities, isLoading: isCommunitiesLoading } = useCommunities();
  const { data: projects, isLoading: isProjectsLoading } = useProjects();
  const navigate = useNavigate();
  
  // Track if selection process has been completed to prevent infinite loops
  const selectionProcessedRef = useRef(false);
  const photoRefreshAttemptedRef = useRef(false);
  const selectionDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
    // Debounce selection processing to prevent multiple runs
    if (selectionDebounceTimerRef.current) {
      clearTimeout(selectionDebounceTimerRef.current);
    }
    
    selectionDebounceTimerRef.current = setTimeout(() => {
      // If already processed or data still loading, skip
      if (selectionProcessedRef.current || isCommunitiesLoading || isProjectsLoading) {
        return;
      }
      
      const isDataLoaded = !isCommunitiesLoading && !isProjectsLoading;
      const hasCommunities = communities && communities.length > 0;
      const hasProjects = projects?.length > 0;
      
      // Only process selection after data has loaded
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
        if (hasProjects) {
          setSelectedProjectId(projects[0].id);
        } else if (hasCommunities) {
          if (communities.length > 0) {
            setSelectedCommunityId(communities[0].id);
          }
        }
        return;
      }
      
      // If a community ID is selected but doesn't exist anymore, reset to first available 
      if (selectedCommunityId && hasCommunities) {
        const communityExists = communities.some(c => c.id === selectedCommunityId);
        if (!communityExists) {
          console.log(`Selected community ${selectedCommunityId} no longer exists, selecting first available`);
          if (communities.length > 0) {
            setSelectedCommunityId(communities[0].id);
          } else {
            setSelectedCommunityId(null);
          }
        }
      }
      
      // If a project ID is selected but doesn't exist anymore, reset to first available
      if (selectedProjectId && hasProjects) {
        const projectExists = projects.some(p => p.id === selectedProjectId);
        if (!projectExists) {
          console.log(`Selected project ${selectedProjectId} no longer exists, selecting first available`);
          if (projects.length > 0) {
            setSelectedProjectId(projects[0].id);
          } else {
            setSelectedProjectId(null);
          }
        }
      }
      
      // Mark as processed to prevent further processing in this session
      selectionProcessedRef.current = true;
      
    }, 300);
    
    return () => {
      if (selectionDebounceTimerRef.current) {
        clearTimeout(selectionDebounceTimerRef.current);
      }
    };
  }, [
    communities, 
    projects, 
    selectedCommunityId, 
    selectedProjectId, 
    isCommunitiesLoading, 
    isProjectsLoading, 
    location, 
    navigate
  ]);

  // Determine if a group is selected (communities can be groups too)
  const selectedCommunity = communities?.find(c => c.id === selectedCommunityId);
  const isGroupSelected = selectedCommunity?.is_group || false;
  const selectedGroupId = isGroupSelected ? selectedCommunityId : null;
  
  // Derived state to determine if a project is selected
  const isProjectSelected = !!selectedProjectId;

  return (
    <ProjectContext.Provider
      value={{
        selectedCommunityId,
        setSelectedCommunityId,
        selectedProjectId,
        setSelectedProjectId,
        isProjectSelected,
        selectedGroupId,
        isGroupSelected
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
