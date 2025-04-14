
import { useContext } from 'react';
import { useProjectContext as useProjectContextBase } from '@/contexts/ProjectContext';
import { useProjects } from '../useProjects';

export const useProjectContext = () => {
  const projectContext = useProjectContextBase();
  const { data: projects, isLoading, error } = useProjects();
  
  // Return a combined object with both projectContext and projects data
  return {
    ...projectContext,
    projects,
    isLoading,
    error
  };
};
