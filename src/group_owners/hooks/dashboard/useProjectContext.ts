
import { useContext } from 'react';
import { ProjectContext } from '@/contexts/ProjectContext';
import { useProjects } from '../useProjects';

export const useProjectContext = () => {
  const projectContext = useContext(ProjectContext);
  const { data: projects, isLoading, error } = useProjects();
  
  if (!projectContext) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  
  return {
    ...projectContext,
    projects,
    isLoading,
    error
  };
};
