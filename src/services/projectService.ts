import { supabase } from '@/lib/supabaseClient';
import { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types/project.types';
import { logger } from '@/utils/logger';

export class ProjectService {
  private static TABLE_NAME = 'projects';

  static async createProject(data: CreateProjectDTO, ownerId: string): Promise<Project> {
    try {
      const { data: project, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([
          {
            ...data,
            owner_id: ownerId,
            status: 'active',
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return project;
    } catch (error) {
      logger.error('Error creating project:', error);
      throw error;
    }
  }

  static async getProjectById(id: string): Promise<Project | null> {
    try {
      const { data: project, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return project;
    } catch (error) {
      logger.error('Error fetching project:', error);
      throw error;
    }
  }

  static async getProjectsByOwnerId(ownerId: string): Promise<Project[]> {
    try {
      const { data: projects, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return projects || [];
    } catch (error) {
      logger.error('Error fetching owner projects:', error);
      throw error;
    }
  }

  static async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
    try {
      const { data: project, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return project;
    } catch (error) {
      logger.error('Error updating project:', error);
      throw error;
    }
  }

  static async deleteProject(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      logger.error('Error deleting project:', error);
      throw error;
    }
  }

  static async validateBotToken(botToken: string): Promise<boolean> {
    try {
      // Make a request to Telegram Bot API to validate the token
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      logger.error('Error validating bot token:', error);
      return false;
    }
  }
}
