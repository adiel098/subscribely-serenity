
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Project } from '@/types/project.types';
import { supabase } from '@/lib/supabaseClient';
import logger from '@/utils/logger';

export interface ProjectContextType {
  projects: Project[] | undefined;
  isLoading: boolean;
  error: string | null;
  selectedProject: Project | null;
  selectedProjectId: string | null;
  setSelectedProject: (project: Project) => void;
  createProject: (project: Omit<Project, 'id' | 'created_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  };

  const {
    data: projects,
    isLoading,
    refetch
  } = useQuery<Project[], Error>({
    queryKey: ['projects'],
    queryFn: fetchProjects
  });

  const createProject = async (projectData: Omit<Project, 'id' | 'created_at'>): Promise<Project> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;
      
      refetch();
      return data;
    } catch (error: any) {
      logger.error('Error creating project:', error);
      setError(error.message);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      refetch();
      return data;
    } catch (error: any) {
      logger.error('Error updating project:', error);
      setError(error.message);
      throw error;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      refetch();
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    } catch (error: any) {
      logger.error('Error deleting project:', error);
      setError(error.message);
      throw error;
    }
  };

  const refreshProjects = () => {
    refetch();
  };

  const value: ProjectContextType = {
    projects,
    isLoading,
    error,
    selectedProject,
    selectedProjectId: selectedProject?.id || null,
    setSelectedProject,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects
  };

  return (
    <ProjectContext.Provider value={value}>
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
