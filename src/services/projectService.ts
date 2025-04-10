import { supabase } from "@/lib/supabaseClient";
import { Project } from "@/types/project.types";
import logger from "@/utils/logger";

// Project CRUD functions

export const fetchProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Error fetching projects:', error);
    throw error;
  }
};

export const createProject = async (projectData: Omit<Project, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id: string) => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    logger.error('Error deleting project:', error);
    throw error;
  }
};
