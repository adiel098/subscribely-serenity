
import { createContext, useContext, useState, useEffect } from "react";
import { useProjects, Project } from "@/group_owners/hooks/useProjects";
import { useLocation, useNavigate } from "react-router-dom";
import { localStorageService } from "@/utils/localStorageService";

type ProjectContextType = {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedProject: Project | null;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

const SELECTED_PROJECT_KEY = 'selectedProjectId';

export const ProjectProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { data: projects, isLoading } = useProjects();
  const navigate = useNavigate();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    // Check for saved project ID in localStorage
    const savedProjectId = localStorage.getItem(SELECTED_PROJECT_KEY);
    return savedProjectId;
  });
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hasCheckedProjects, setHasCheckedProjects] = useState(false);

  const location = useLocation();

  // Save the selected project ID to localStorage when it changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem(SELECTED_PROJECT_KEY, selectedProjectId);
    } else {
      localStorage.removeItem(SELECTED_PROJECT_KEY);
    }
  }, [selectedProjectId]);

  // Update selected project when projects load or selection changes
  useEffect(() => {
    if (projects && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      setSelectedProject(project || null);
    } else {
      setSelectedProject(null);
    }

    // Mark that we've checked projects after they've loaded
    if (!isLoading && !hasCheckedProjects) {
      setHasCheckedProjects(true);
    }
  }, [projects, selectedProjectId, isLoading, hasCheckedProjects]);

  // Handle project selection and onboarding redirection
  useEffect(() => {
    // Don't do anything if projects are still loading
    if (isLoading) return;
    
    // Wait until we've done the initial check of projects
    if (!hasCheckedProjects) return;
    
    // Check if user is in onboarding process - if so, don't redirect to project creation
    const isInOnboardingProcess = location.pathname.startsWith('/onboarding');
    const onboardingStatus = localStorageService.getOnboardingStatus();
    const isOnboardingCompleted = onboardingStatus?.isCompleted || false;
    
    // Don't redirect if user is in onboarding process or route is not dashboard
    if (isInOnboardingProcess || !location.pathname.match(/^\/(dashboard)?$/)) {
      return;
    }
    
    const hasProjects = projects && projects.length > 0;
    
    // Only redirect to project creation if:
    // 1. User has completed onboarding
    // 2. User has no projects
    // 3. User is trying to access the dashboard
    // 4. We've already loaded projects (hasCheckedProjects)
    if (isOnboardingCompleted && !hasProjects && location.pathname.match(/^\/(dashboard)?$/) && hasCheckedProjects) {
      console.log("Onboarding completed, no projects found - redirecting to project creation");
      navigate('/projects/new', { replace: true });
      return;
    }
    
    // If nothing is selected but we have projects, select one
    if (!selectedProjectId && hasProjects) {
      setSelectedProjectId(projects[0].id);
      return;
    }
    
    // If a project is selected but doesn't exist anymore, select another one
    if (selectedProjectId && hasProjects && !projects.find(p => p.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
      return;
    }
  }, [projects, selectedProjectId, isLoading, location.pathname, navigate, hasCheckedProjects]);

  return (
    <ProjectContext.Provider value={{
      selectedProjectId,
      setSelectedProjectId,
      selectedProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
