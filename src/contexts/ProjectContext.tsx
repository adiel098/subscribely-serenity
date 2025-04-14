
import { createContext, useContext, useState, useEffect } from "react";
import { useProjects, Project } from "@/group_owners/hooks/useProjects";
import { useLocation, useNavigate } from "react-router-dom";
import { localStorageService } from "@/utils/localStorageService";
import { toast } from "sonner";

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
  const { data: projects, isLoading, error, isError } = useProjects();
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

  // Show error toast if project loading fails
  useEffect(() => {
    if (isError && error) {
      toast.error("שגיאה בטעינת הפרוייקטים", {
        description: "אנא נסה שוב מאוחר יותר או צור קשר עם התמיכה"
      });
      console.error("Project loading error:", error);
    }
  }, [isError, error]);

  // Update selected project when projects load or selection changes
  useEffect(() => {
    if (projects && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      setSelectedProject(project || null);
      
      // If selected project not found but we have projects
      if (!project && projects.length > 0) {
        console.log("Selected project not found, switching to first available project");
        setSelectedProjectId(projects[0].id);
      }
    } else {
      setSelectedProject(null);
    }

    // Mark that we've checked projects after they've loaded
    if (!isLoading && !hasCheckedProjects) {
      console.log("Projects loaded, marking as checked. Found", projects?.length || 0, "projects");
      setHasCheckedProjects(true);
    }
  }, [projects, selectedProjectId, isLoading, hasCheckedProjects]);

  // Handle project selection - REMOVED AUTO-REDIRECT TO PROJECT CREATION
  useEffect(() => {
    // Don't do anything if projects are still loading
    if (isLoading) {
      console.log("Projects are still loading, skipping redirection logic");
      return;
    }
    
    // Wait until we've done the initial check of projects
    if (!hasCheckedProjects) {
      console.log("Haven't checked projects yet, skipping redirection logic");
      return;
    }
    
    // Check if user is in onboarding process - if so, don't redirect
    const isInOnboardingProcess = location.pathname.startsWith('/onboarding');
    
    // Don't redirect if user is in onboarding process
    if (isInOnboardingProcess) {
      return;
    }
    
    const hasProjects = projects && projects.length > 0;
    console.log("Project redirection check - hasProjects:", hasProjects, "projectsCount:", projects?.length);
    
    // If nothing is selected but we have projects, select one
    if (!selectedProjectId && hasProjects) {
      console.log("No project selected but projects exist, selecting first one:", projects[0].id);
      setSelectedProjectId(projects[0].id);
      return;
    }
    
    // If a project is selected but doesn't exist anymore, select another one
    if (selectedProjectId && hasProjects && !projects.find(p => p.id === selectedProjectId)) {
      console.log("Selected project no longer exists, switching to first available project");
      setSelectedProjectId(projects[0].id);
      return;
    }
  }, [projects, selectedProjectId, isLoading, location.pathname, hasCheckedProjects]);

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
