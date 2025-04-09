
import { createContext, useContext, useState, useEffect } from "react";
import { useProjects, Project } from "@/group_owners/hooks/useProjects";
import { useLocation, useNavigate } from "react-router-dom";

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
  }, [projects, selectedProjectId]);

  // Handle project selection and onboarding redirection
  useEffect(() => {
    if (isLoading) return;
    
    const hasProjects = projects && projects.length > 0;
    
    // Skip redirection if already on the /projects/new route
    if (location.pathname === '/projects/new') {
      return;
    }
    
    // If user has no projects and they're trying to access the dashboard,
    // redirect them to the project creation flow
    if (!hasProjects && location.pathname === '/dashboard') {
      console.log("No projects found - redirecting to project creation");
      // Don't redirect if they're already in the onboarding flow
      if (!location.pathname.startsWith('/onboarding')) {
        navigate('/projects/new', { replace: true });
        return;
      }
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
  }, [projects, selectedProjectId, isLoading, location.pathname, navigate]);

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
