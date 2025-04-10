
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Project } from '@/types/project.types';
import { useProjects } from '@/group_owners/hooks/useProjects';
import { createLogger } from '@/utils/debugUtils';

const logger = createLogger('ProjectContext');

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  isLoading: boolean; // Alias for compatibility
  error: string;
  selectedProject: Project | null;
  selectedCommunityId: string | null;
  setSelectedProject: (project: Project | null) => void;
  setSelectedCommunityId: (communityId: string | null) => void;
  setProjects: (projects: Project[]) => void;
  refreshProjects: () => Promise<void>;
  refetch: () => Promise<any>; // Alias for compatibility
  createProject: (data: any) => Promise<any>;
  updateProject: (projectId: string, data: any) => Promise<any>;
  deleteProject: (projectId: string) => Promise<any>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [navigationState, setNavigationState] = useState<Record<string, any>>({});

  // Use the existing hook
  const { 
    projects, 
    loading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject,
    refreshProjects,
    refetch
  } = useProjects();

  // Custom function to set projects (if needed)
  const setProjects = (newProjects: Project[]) => {
    // In the current implementation, we can't directly set projects
    // This is a placeholder for compatibility
    console.warn("setProjects called, but it's not directly implemented. Consider using refreshProjects instead.");
  };

  // Store navigation state for debugging
  useEffect(() => {
    const state = {
      projectsCount: projects?.length || 0,
      selectedProjectId: selectedProject?.id,
      selectedCommunityId,
    };
    setNavigationState(state);
    logger('Navigation state:', state);
  }, [projects, selectedProject, selectedCommunityId]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        isLoading: loading, // Alias for compatibility
        error,
        selectedProject,
        selectedCommunityId,
        setSelectedProject,
        setSelectedCommunityId,
        setProjects,
        refreshProjects,
        refetch: refetch, // Alias for compatibility
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
