
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/contexts/AuthContext";
import { toast } from "sonner";
import { Project } from "./types/project.types";
import { createLogger } from "@/telegram-mini-app/utils/debugUtils";

const logger = createLogger("useProjects");

export const useProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      if (!user) {
        logger.log("No user found, returning empty array");
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
          toast.error("Failed to fetch projects");
          throw error;
        }
        
        logger.log("Successfully fetched projects:", data);
        return data as Project[];
      } catch (error) {
        logger.error("Exception in projects query:", error);
        toast.error("An error occurred while fetching projects");
        return [];
      }
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnWindowFocus: true
  });
};

export const useProject = (projectId?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }
      
      logger.log(`Fetching project ${projectId}`);
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .eq("owner_id", user?.id)
        .single();
      
      if (error) {
        logger.error(`Error fetching project ${projectId}:`, error);
        throw error;
      }
      
      return data as Project;
    },
    enabled: !!projectId && !!user?.id
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newProject: { name: string; description: string | null; bot_token: string | null }) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      logger.log("Creating new project:", newProject);
      
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...newProject,
          owner_id: user.id
        })
        .select("*")
        .single();
      
      if (error) {
        logger.error("Error creating project:", error);
        throw error;
      }
      
      return data as Project;
    },
    onSuccess: (data) => {
      logger.log("Project created successfully:", data);
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      logger.error("Failed to create project:", error);
      toast.error("Failed to create project");
    }
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Project> 
    }) => {
      logger.log(`Updating project ${id}:`, updates);
      
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();
      
      if (error) {
        logger.error(`Error updating project ${id}:`, error);
        throw error;
      }
      
      return data as Project;
    },
    onSuccess: (data) => {
      logger.log("Project updated successfully:", data);
      toast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", data.id] });
    },
    onError: (error) => {
      logger.error("Failed to update project:", error);
      toast.error("Failed to update project");
    }
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      logger.log(`Deleting project ${projectId}`);
      
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);
      
      if (error) {
        logger.error(`Error deleting project ${projectId}:`, error);
        throw error;
      }
      
      return { success: true, id: projectId };
    },
    onSuccess: (_, id) => {
      logger.log(`Project ${id} deleted successfully`);
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      logger.error("Failed to delete project:", error);
      toast.error("Failed to delete project");
    }
  });
};
