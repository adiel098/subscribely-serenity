
import { useQuery } from '@tanstack/react-query';
import * as projectService from '@/services/projectService';
import { useEffect, useRef, useState } from 'react';

export interface Project {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
}

export const useProjects = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const hasLoggedFetch = useRef(false);
  
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.fetchProjects,
    staleTime: 60000, // Cache results for 1 minute
    refetchOnWindowFocus: false, // Prevent refetches on window focus
    retry: 1 // Limit retries to avoid excessive loading
  });
  
  // Log only on initial load and status changes
  useEffect(() => {
    if (projectsQuery.isSuccess && isInitialLoad) {
      if (!hasLoggedFetch.current) {
        console.log(`[useProjects] Fetched ${projectsQuery.data?.length || 0} projects`);
        hasLoggedFetch.current = true;
      }
      setIsInitialLoad(false);
    } else if (projectsQuery.isError && isInitialLoad) {
      console.error('[useProjects] Error fetching projects:', projectsQuery.error);
      setIsInitialLoad(false);
    }
  }, [projectsQuery.isSuccess, projectsQuery.isError, projectsQuery.data, isInitialLoad]);
  
  return {
    data: projectsQuery.data,
    isLoading: projectsQuery.isLoading && isInitialLoad,
    error: projectsQuery.error,
    isError: projectsQuery.isError
  };
};
