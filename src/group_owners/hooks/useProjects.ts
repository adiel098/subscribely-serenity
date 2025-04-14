
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth"; 
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjects");

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  owner_id: string;
  bot_token?: string | null;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!user?.id) {
        logger.warn("No user ID available for fetching projects");
        return [];
      }
      
      logger.log("Fetching projects for user:", user.id);
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });
        
        if (error) {
          logger.error("Error fetching projects:", error);
          throw error;
        }
        
        logger.log(`Fetched ${data?.length || 0} projects`);
        return data as Project[];
      } catch (error) {
        logger.error("Exception in projects fetch:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
    retry: 2, // Add retry logic
    staleTime: 60000 // Cache valid for 1 minute
  });
};

// Add the missing useProject hook
export const useProject = (projectId?: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      
      logger.log("Fetching single project:", projectId);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        logger.error("Error fetching project:", error);
        throw error;
      }
      
      return data as Project;
    },
    enabled: !!projectId,
    retry: 1
  });
};

// Add the missing useCreateProject hook
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'created_at' | 'owner_id' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User ID not available');
      
      logger.log("Creating new project for user:", user.id);
      
      const projectData = {
        ...newProject,
        owner_id: user.id
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();
        
      if (error) {
        logger.error("Error creating project:", error);
        throw error;
      }
      
      logger.log("Project created successfully:", data.id);
      return data;
    },
    onSuccess: () => {
      logger.log("Invalidating projects query cache");
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
};

// Add the missing useUpdateProject hook
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Project> }) => {
      logger.log("Updating project:", id);
      
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        logger.error("Error updating project:", error);
        throw error;
      }
      
      logger.log("Project updated successfully:", id);
      return data;
    },
    onSuccess: (data) => {
      logger.log("Invalidating project cache after update");
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    }
  });
};
