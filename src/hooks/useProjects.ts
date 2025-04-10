
import { useQuery } from '@tanstack/react-query';
import * as projectService from '@/services/projectService';

export const useProjects = () => {
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.fetchProjects
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error
  };
};
