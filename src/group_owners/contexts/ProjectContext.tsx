
import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Project } from "@/types/project.types"; 
import { createLogger } from "@/utils/debugUtils";

const logger = createLogger("ProjectContext");

interface ProjectContextType {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectContextProviderProps {
  children: ReactNode;
}

export const ProjectContextProvider = ({ children }: ProjectContextProviderProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use TanStack Query for data fetching
  const query = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        logger.log("Fetching projects");
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setProjects(data || []);
        return data as Project[];
      } catch (err) {
        if (err instanceof Error) {
          logger.error("Error fetching projects:", err.message);
          setError(err.message);
        } else {
          logger.error("Unknown error fetching projects");
          setError("Unknown error fetching projects");
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    }
  });

  // Manually setup project operations (create, update, delete)
  const createProject = async (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      setProjects(prev => [data, ...prev]);
      
      return data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create project");
      }
      throw err;
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
      
      // Update local state
      setProjects(prev => prev.map(p => p.id === id ? data : p));
      
      return data;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update project");
      }
      throw err;
    }
  };
  
  const deleteProject = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setProjects(prev => prev.filter(p => p.id !== id));
      
      // Reset selected project if it was deleted
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete project");
      }
      throw err;
    }
  };
  
  const refreshProjects = async (): Promise<void> => {
    await query.refetch();
  };

  return (
    <ProjectContext.Provider value={{
      selectedProjectId,
      setSelectedProjectId,
      projects,
      isLoading: query.isLoading || isLoading,
      error,
      createProject,
      updateProject,
      deleteProject,
      refreshProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectContextProvider');
  }
  return context;
};
